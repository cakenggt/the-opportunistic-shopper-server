'use strict';

const pg = require('pg');

/**
 * A User record
 * @typedef {Object} User
 * @property {Number} id - Id of the user
 * @property {String} email - Email of the user
 * @property {String} google_id Google id token
 */

 /**
  * A User Store record
  * @typedef {Object} UserStore
  * @property {Number} user_id - Id of the user
  * @property {Number} store_id - Id of the store
  * @property {String} name User defined name of the store
  */

/**
 * A Store and Product JSON
 * @typedef {Object} StoreAndProductJSON
 * @property {Object} products - Product map
 * @property {Array.<Number>} products.ids - Array of product ids
 * @property {Object} products.data - Map of product id to product data
 * @property {String} products.data.name - Name of product
 * @property {String} products.data.description - Description of product
 * @property {String} products.data.status - Status of product
 * @property {Array.<Number>} products.data.stores - Array of store ids
 * this product is found at
 * @property {Object} stores - Store map
 * @property {Array.<Number>} stores.ids - Array of store ids
 * @property {Object} stores.data - Map of product id to store data
 * @property {String} stores.data.name - Name of store
 * @property {Number} stores.data.latitude - Latitude of store
 * @property {Number} stores.data.longitude - Longitude of store
 * @property {Array.<Number>} stores.data.products - Array of product ids
 * found at this store
 */

class UserManager {
  constructor(models){
    this.models = models;
    this.storeManager = require('../manager/storeManager')(models);
    this.productManager = require('../manager/productManager')(models);
  }

  /**
   * Finds a user by their google ID
   * @param {String} id Google id of the user
   * @returns {Promise} Promise which resolves with one User
   */
  findUserByGoogleId(id){
    return this.models.User.findOne({
      where: {
        googleId: id
      }
    });
  }

  /**
   * Finds a user with a certain Google ID. If they don't
   * exist, then it inserts a new record into the db.
   * @param {String} id Google id of the user
   * @param {String} email Email of the user
   * @returns {Promise} Promise which resolves with one User
   */
  findOrCreateUserByGoogleId(id, email){
    return this.models.User.findOrCreate({
      where: {
        googleId: id
      },
      defaults: {
        email: email
      }
    });
  }

  /**
   * Creates a user store association.
   * @param {Number} userId Id of the user
   * @param {Number} storeId Id of the store
   * @returns {Promise} Promise which resolves with the result of the query
   */
  createUserStoreAssociation(userId, storeId, name){
    let self = this;
    return this.models.User.findOne({
      where: {
        id: userId
      }
    })
    .then(function(user){
      return self.models.Store.findOne({
        where: {
          id: storeId
        }
      }).then(function(store){
        return user.addStore(store, {
          name: name
        });
      });
    });
  }

  /**
   * Deletes a user store association
   * @param {Number} user_id Id of the user
   * @param {Number} store_id Id of the store
   * @returns {Promise} Promise which resolves with the result of the query
   */
  deleteUserStoreAssociation(user_id, store_id){
    let self = this;
    return new Promise(function(resolve, reject){
      pg.connect(self.connectionString, function(err, client, done){
        if (err){
          done();
          reject(err);
          return;
        }
        client.query(`
          delete
          from user_stores
          where user_id = $1 and store_id = $2`, [user_id, store_id],
        function(err, result){
          if (err){
            reject(err);
            done();
            return;
          }
          done();
          resolve(result);
        });
      });
    });
  }

  /**
   * Updates a user store record.
   * @param {UserStore} store Object representation of the user store to update
   * @returns {Promise} Promise which resolves with the result of the query
   */
  updateUserStoreAssociation(association){
    let self = this;
    return new Promise(function(resolve, reject){
      pg.connect(self.connectionString, function(err, client, done){
        if (err){
          done();
          reject(err);
          return;
        }
        client.query(`
          update user_stores
          set name = $1
          where user_id = $2 and store_id = $3`,
        [association.name, association.userId, association.store_id],
        function(err, result){
          if (err){
            reject(err);
            done();
            return;
          }
          done();
          resolve(result);
        });
      });
    });
  }

  /**
   * Gets the complete store and product json for the user.
   * @param {Number} userId Id of the user
   * @returns {StoreAndProductJSON} Store and product JSON
   */
  getCompleteStoreAndProductDataByUser(userId){
    let totalResult = {};
    let self = this;
    return Promise.all([
      self.productManager.findProductsByUserAndFetchStores(userId)
      .then(function(result){
        let products = {};
        let ids = [];
        let data = {};
        for (let r = 0; r < result.length; r++){
          let res = result[r];
          //If not already in the ids list, put there
          if (!data[res.product_id]){
            ids.push(res.product_id);
          }
          let entry = data[res.product_id]||{stores:[]};
          entry.name = res.name;
          entry.description = res.description;
          entry.status = res.status;
          if (res.store_id){
            entry.stores.push(res.store_id);
          }
          data[res.product_id] = entry;
        }
        products.ids = ids;
        products.data = data;
        totalResult.products = products;
      }),
      self.storeManager.findStoresByUserAndFetchProducts(userId)
      .then(function(result){
        let stores = {};
        let ids = [];
        let data = {};
        for (let r = 0; r < result.length; r++){
          let res = result[r];
          //If not already in the ids list, put there
          if (!data[res.store_id]){
            ids.push(res.store_id);
          }
          let entry = data[res.store_id]||{products:[]};
          entry.name = res.name;
          entry.latitude = res.latitude;
          entry.longitude = res.longitude;
          if (res.product_id){
            entry.products.push(res.product_id);
          }
          data[res.store_id] = entry;
        }
        stores.ids = ids;
        stores.data = data;
        totalResult.stores = stores;
      })
    ])
    .then(function(){
      return totalResult;
    });
  }
}

module.exports = function(connectionString){
  return new UserManager(connectionString);
};
