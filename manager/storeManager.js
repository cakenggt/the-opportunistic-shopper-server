'use strict';

const storeDao = require('../dao/storeDao');

exports.getStoresByUser = function(userId){
  return storeDao.getStoresByUser(userId);
};

exports.getStoresWithinRadiusOfUser = function(userId, location, radius){
  return storeDao.getStoresWithinRadiusOfUser(userId, location, radius);
};
