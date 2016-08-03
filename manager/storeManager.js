'use strict';

const storeDao = require('../dao/storeDao');

/**
 * Gets the stores that a user is associated with.
 * @param {Number} userId User ID
 * @returns {Promise} Promise which resolves with an array of Stores
 */
exports.getStoresByUser = function(userId){
  return storeDao.getStoresByUser(userId);
};

/**
 * Gets the stores that are associated with a user and are also
 * within a certain radius of a location.
 * @param {Number} userId User ID
 * @param {Object} location Location object
 * @param {Number} location.latitude Latitude value
 * @param {Number} location.longitude Longitude value
 * @param {Number} radius Radius in meters
 * @returns {Promise} Promise which resolves with an array of Stores
 */
exports.getStoresWithinRadiusOfUser = function(userId, location, radius){
  return storeDao.getStoresWithinRadiusOfUser(userId, location, radius);
};
