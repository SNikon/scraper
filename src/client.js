import osmosis from 'osmosis';
import request from 'request';
import pushRoutine from './pushRoutine';
import logger from './utils/logger';
import config from './utils/config';

const getUrlParameterByName = (name, url) => {
  name = name.replace(/[\[\]]/g, "\\$&");
  const regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url);

  if (!results || !results[2]) {
    return '';
  }

  return decodeURIComponent(results[2].replace(/\+/g, " "));
};
const digitRegex = new RegExp(/[+-]?\d+(\.\d+)?/g);
const scrapedData = [];

osmosis
  .get('https://www.tesco.com/groceries/product/browse/default.aspx?N=4292234134&Ne=4294793660&icid=FRE_LHN_FreshFruit')
  .paginate('.next > a')
  .delay(config.osmosis.pageDelay)
  .find('.gridView .product')
  .set({
    href: 'a@href',
    title: 'span[data-title]',
    price: '.linePrice',
    priceKg: '.linePriceAbbr',
    unavailable: '.unavailable'
  })
  .delay(config.osmosis.followDelay)
  .follow('@href')
  .set({
    imagery: ['.largeImage img@src']
  })
  .then((context, data, next) => {
    logger.debug('Imagery data retrieved.');

    if (Array.isArray(data.imagery)) {
      Promise.all(
        data.imagery.map((image, index) => {
          return new Promise(
            resolve => {
              request({
                url: image,
                encoding: null
              },
              (error, response, body) => {
                logger.debug('Image fetched.');
                data.imagery[index] = `data:${response.headers['content-type']};base64,${body.toString('base64')}`;
                resolve();
              })
            }
          );
        })
      )
      .then(() => {
        logger.debug('Imagery fetch complete.');
        next(context, data);
      })
      .catch(err => {
        console.log(err);
      })
    } else {
      logger.debug('No imagery to fetch.');
      next(context, data);
    }
  })
  .data(entry => {
    const priceMatch = entry.price && entry.price.match(digitRegex);
    const priceKgMatch = entry.priceKg && entry.priceKg.match(digitRegex);

    const price = Array.isArray(priceMatch) && parseFloat(priceMatch[0]);
    const priceKg = Array.isArray(priceKgMatch) && parseFloat(priceKgMatch[0]);

    scrapedData.push({
      available: !entry.unavailable,
      id: getUrlParameterByName('id', entry.href),
      images: entry.imagery,
      owner: 'tesco',
      price,
      priceKg,
      title: entry.title
    })
  })
  .done(() => {
    logger.info('Submitting information to dbms');
    pushRoutine('tesco', scrapedData);
  })
  .log(console.log)
  .error(console.error);
