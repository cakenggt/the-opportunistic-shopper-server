'use strict';

const userDao = require('../dao/userDao');

/**
 * Finds a user by their google ID
 * @param {String} id Google id of the user
 * @returns {Promise} Promise which resolves with one User
 */
function findUserByGoogleId(id){
  return userDao.findUserByGoogleId(id);
}

exports.findUserByGoogleId = findUserByGoogleId;

/**
 * Finds a user with a certain Google ID. If they don't
 * exist, then it inserts a new record into the db.
 * @param {String} id Google id of the user
 * @param {String} email Email of the user
 * @returns {Promise} Promise which resolves with one User
 */
exports.findOrCreateUserByGoogleId = function(id, email){
  return userDao.createGoogleUserIfNotExists(id, email)
  .then(function(){
    return findUserByGoogleId(id);
  });
};
