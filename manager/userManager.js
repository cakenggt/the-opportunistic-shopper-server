'use strict';

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
      return user.addStore(storeId, {
        name: name
      });
    });
  }

  /**
   * Gets the complete store and product json for the user.
   * @param {Number} userId Id of the user
   * @returns {Promise} Promise which results in a StoreAndProductJSON
   */
  getCompleteStoreAndProductDataByUser(userId){
    let totalResult = {
      stores: {
        ids: [],
        data: {}
      },
      products: {
        ids: [],
        data: {}
      }
    };
    return this.models.User.findOne({
      where: {
        id: userId
      }
    })
    .then(function(user){
      return user.getStores()
      .then(function(stores){
        for (let s = 0; s < stores.length; s++){
          let store = stores[s];
          let plainStore = store.get({
            plain: true
          });
          totalResult.stores.ids.push(plainStore.id);
          totalResult.stores.data[plainStore.id] = plainStore;
          totalResult.stores.data[plainStore.id].products = [];
        }
      })
      .then(function(){
        return user.getProducts()
        .then(function(products){
          for (let p = 0; p < products.length; p++){
            let product = products[p];
            let plainProduct = product.get({
              plain: true
            });
            totalResult.products.ids.push(plainProduct.id);
            totalResult.products.data[plainProduct.id] = plainProduct;
            totalResult.products.data[plainProduct.id].stores = [];
            product.getStores()
            .then(function(stores){
              for (let s = 0; s < stores.length; s++){
                let store = stores[s];
                let plainStore = store.get({
                  plain: true
                });
                totalResult.products.data[plainProduct.id].stores.push(plainStore.id);
                totalResult.stores.data[plainStore.id].products.push(plainProduct.id);
              }
            });
          }
        });
      });
    })
    .then(function(){
      return totalResult;
    });
  }
}

module.exports = function(connectionString){
  return new UserManager(connectionString);
};
