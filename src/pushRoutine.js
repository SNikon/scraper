import database from './utils/sql';
import logger from './utils/logger';
import config from './utils/config';

const pushData = (owner, data) => {
  const db = new database();
  db
    // Connect to DMBS
    .connect(config.database.port, config.database.user, config.database.pwd)
    // Set the active database
    .then(
      () => {
        logger.info('Successfully connected to dbms.');
        return db
          .useDatabase('scraper_db')
          .then(
            () => logger.info('Connected to scraper_db'),
            err => logger.error('Failed to create database.', err)
          );
      },
      err => (logger.error('Failed to connect to database.', err))
    )
    // Clear by owner
    .then(
      () => {
        return db
          .clearOwner(owner)
          .then(
            result => logger.debug(result),
            error => logger.error(error)
          );
      }
    )
    // Push all products
    .then(
      () => {
        data.forEach(entry => {
          db
            .insertProduct(entry)
            .then(
              result => logger.info(result),
              error => logger.error(error)
            );
        });
      }
    )
    .catch(() => null);
};

export default pushData;
