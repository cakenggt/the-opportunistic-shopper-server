'use strict';

const storeDao = require('../dao/storeDao');

exports.getStoresByUser = function(userId){
  return storeDao.getStoresByUser(userId);
};
