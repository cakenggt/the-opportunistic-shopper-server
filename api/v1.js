'use strict';

const storeManager = require('../manager/storeManager');
const productManager = require('../manager/productManager');
const prefix = '/api/v1/';

module.exports = function(app){
  app.get(prefix+'all', function(req, res){
    //TODO
  });

  app.get(prefix+'nearby', function(req, res){
    //TODO
  });

  app.post(prefix+'product', function(req, res){
    //TODO
  });

  app.post(prefix+'store', function(req, res){
    //TODO
  });
};
