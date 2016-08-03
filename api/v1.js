'use strict';

const storeManager = require('../manager/storeManager');
const productManager = require('../manager/productManager');
const prefix = '/api/v1/';

module.exports = function(app){
  app.get(prefix+'all', function(req, res){
    //TODO
  });

  app.get(prefix+'nearby', function(req, res){
    //Get stores within 50 meters
    let location = {
      latitude: req.query.lat,
      longitude: req.query.lon
    };
    storeManager.getStoresWithinRadiusOfUser(req.profile.id, location, 50)
    .then(function(result){
      let storeIds = [];
      for (var r = 0; r < result.length; r++){
        storeIds.push(result[r].id);
      }
      res.json({
        stores: storeIds
      });
      res.end();
    });

  });

  app.post(prefix+'product', function(req, res){
    //TODO
  });

  app.post(prefix+'store', function(req, res){
    //TODO
  });
};
