const api = require('../controllers/api');

const routes = {};

routes.connect = (app) => {
  app.use('/api', api);
};

module.exports = routes;
