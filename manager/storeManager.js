'use strict';

/**
 * A Location
 * @typedef {Object} Location
 * @property {Number} latitude Latitude value
 * @property {Number} longitude Longitude value
 */

/**
 * A Store record
 * @typedef {Object} Store
 * @property {Number} id - Id of the store
 * @property {String} name - Name of the store. If gotten with a user's id,
 * then this will be the name the user custom-assigned to their store record
 * @property {Number} latitude Latitude value
 * @property {Number} longitude Longitude value
 * @property {Number} created_by_user_id - Id of the user who created this store
 */

class StoreManager {
  constructor(models){
    this.models = models;
  }

  /**
   * Gets the stores that are associated with a user and are also
   * within a certain radius of a location.
   * @param {Number} userId User ID
   * @param {Location} location Location object
   * @returns {Promise} Promise which resolves with Array.<Store>
   */
  findStoresWithinRadiusOfUser(userId, location, radius){
    return this.models.User.findOne({
      where: {
        id: userId
      }
    })
    .then(function(user){
      return user.getStores({
        scope: [
          {
            method: [
              'distance',
              location,
              radius
            ]
          }
        ]
      });
    });
  }

  /**
   * Gets the stores that are within a certain radius of a location.
   * @param {Location} location Location object
   * @param {Number} radius Radius in meters
   * @returns {Promise} Promise which resolves with Array.<Store>
   */
  findStoresWithinRadiusOfLocation(location, radius){
    return this.models.Store.scope([{
      method: [
        'distance',
        location,
        radius
      ]
    }]).findAll();
  }

  /**
   * Creates a store
   * @param {String} name Store name
   * @param {Location} location Location object
   * @param {Number} userId Created by user id
   * @returns {Promise} Promise which resolves with the query result
   */
  createStore(name, location, userId){
    let point = {
      type: 'Point',
      coordinates: [
        location.longitude,
        location.latitude
      ]
    };
    return this.models.Store.create({
      user: {
        id: userId
      },
      name: name,
      location: point
    }, {
      include: [this.models.User]
    });
  }
}

module.exports = function(connectionString){
  return new StoreManager(connectionString);
};
