const debug = true;
const config = {
  database : {
    port: 8090,
    pwd: '4Ytt*^eTZU33',
    user: 'scraper'
  },
  debug,
  logger: {
    colors: {
      debug: 'white',
      error: 'red',
      info: 'blue',
      silly: 'green',
      warn: 'orange'
    },
    disable: false,
    level: debug ? 'debug': 'info',
    quit: false
  },
  osmosis: {
    pageDelay: 2000,
    followDelay: 5000
  }
};

export default config;
