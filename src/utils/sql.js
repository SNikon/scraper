import mysql from 'mysql';
import logger from './logger';
import config from './config';

const queryCallback = (resolve, reject, err, result) => {
  if (err) {
    reject(err);
    return;
  }
  resolve(result);
};

const queryProxy = (connection, query, params, callback) => {
  if (config.debug) {
    logger.debug(mysql.format(query, params));
  }

  return connection.query(
    query,
    params,
    callback
  );
};

class db {
  constructor (srv, usr, pwd) {
    this.connection = null;
  }

  connect(port, usr, pwd) {
    this.connection = mysql.createConnection({
      port,
      user: usr,
      password: pwd
    });

    const that = this;
    return new Promise((resolve, reject) => {
      that.connection.connect((err) => {
        if (err) {
          reject(err);
          return;
        }

        resolve();
      });
    });
  }

  useDatabase (dbName) {
    return new Promise((resolve, reject) => {
      queryProxy(
        this.connection,
        'USE ??;',
        [dbName],
        queryCallback.bind(null, resolve, reject));
    });
  }

  clearOwner (owner) {
    return new Promise((resolve, reject) => {
      queryProxy(
        this.connection,
        'DELETE FROM products WHERE owner like ?;',
        [owner],
        queryCallback.bind(null, resolve, reject));
    });
  }

  insertProduct (product) {
    return new Promise((resolve, reject) => {
      const conn = this.connection;

      logger.debug('Starting product transaction...');
      // Begin transaction
      conn.beginTransaction(transactionError => {
        // Unable to process transaction
        if (transactionError) {
          reject(transactionError);
          return;
        }

        // Should the product insert succeed or fail..
        const productPromise = new Promise(
          (productResolve, productReject) => {
            logger.debug(`Committing product ${product.title} to the database...`);
            // Insert product first
            queryProxy(
              conn,
              'INSERT INTO products SET id=?,title=?,price=?,priceKg=?,available=?, owner=?',
              [product.id, product.title, product.price, product.priceKg, product.available, product.owner],
              queryCallback.bind(null, productResolve, productReject)
            );
          })
        // Keep product Id and insert imagery and keep their Id
          .then(() => {
            logger.debug('Product successfully commited.');

            // Insert Imagery
            if (Array.isArray(product.images)) {
              logger.debug('Committing product image...');

              return Promise.all(
                product.images.map(((image, imgIdx) => {
                  return new Promise((imgResolve, imgReject) => {
                    queryProxy(
                      conn,
                      'INSERT INTO images SET data=?, product_id=?',
                      [image, product.id],
                      (imageErr) => {
                        if (imageErr) {
                          conn.rollback(() => {
                            imgReject(imageErr);
                          });
                          return;
                        }

                        logger.debug(`Image ${imgIdx} successfully submitted.`);
                        imgResolve();
                      }
                    );
                  });
                }))
              );
            }
          }, productError => {
            conn.rollback(() => {
              reject(productError);
            });
          });

        return productPromise.then(
          // Complete the transaction when all promises are resolved
          () => {
            conn.commit((commitErr) => {
              if (commitErr) {
                conn.rollback(() => {
                  reject(commitErr);
                });
                return;
              }

              logger.debug('Transaction complete.');
              resolve();
            });
          })
          .catch(err => {
            conn.rollback(() => {
              logger.error(' Transaction failed.');
              reject(err);
            });
          });
      });
    });
  }
}

export default db;
