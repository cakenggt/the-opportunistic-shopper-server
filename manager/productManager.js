'use strict';

const productDao = require('../dao/productDao');

/**
 * Gets all products that a user has created, both active
 * and crossed off.
 * @param {Number} userId User ID
 * @returns {Promise} Promise which resolves with an array of Products
 */
exports.getProductsByUser = function(userId){
  return productDao.getProductsByUser(userId);
};
