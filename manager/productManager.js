'use strict';

const productDao = require('../dao/productDao');

exports.getProductsByUser = function(userId){
  return productDao.getProductsByUser(userId);
};
