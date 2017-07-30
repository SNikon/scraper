import osmosis from 'osmosis';
import pushRoutine from './pushRoutine';
import logger from './utils/logger';
import config from './utils/config';

const scrapedData = [];

pushRoutine('tesco', [{
  id: 1001100,
  title: 'test',
  price: 1.01,
  priceKg: 2.10,
  available: true,
  owner: 'tesco',
  images: ['bananaaaaaa', 'merdaaaaa']
}]);

// osmosis
//   .get('https://www.tesco.com/groceries/product/browse/default.aspx?N=4292234134&Ne=4294793660&icid=FRE_LHN_FreshFruit')
///  .paginate('.next > a')
//   .delay(config.osmosis.pageDelay)
//   .find('.gridView .product')
//   .set({
//     href: 'a@href',
//     image: '.image img@src',
//     title: 'span[data-title]',
//     price: '.linePrice',
//     priceKg: '.linePriceAbbr',
//     unavailable: '.unavailable'
//   })
//   .delay(config.osmosis.followDelay)
//   .follow('@href')
//   .set({
//     imagery: ['.largeImage img@src']
//   })
//   .data(entry => {
//     scrapedData.push({
//
//     })
//   })
//   .done(() => {
//     pushRoutine('tesco', scrapedData);
//   })
//   .log(console.log)
//   .error(console.error);
