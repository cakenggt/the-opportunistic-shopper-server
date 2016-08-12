'use strict';

/**
 * A Product record
 * @typedef {Object} Product
 * @property {String} name - Name of the product
 * @property {String} description - Description of the product
 * @property {Number} user_id Id of the user who this product belongs to
 * @property {String} status Status of product
 * @property {boolean} sponsored - Whether product is sponsored or not
 */

class ProductManager {
  constructor(models){
    this.models = models;
  }

  /**
   * Gets all products that a user has created, both active
   * and crossed off.
   * @param {Number} userId User ID
   * @returns {Promise} Promise which resolves with an array of Products
   */
  findProductsByUser(userId){
    return this.models.User.findOne({
      id: userId
    })
    .then(function(user){
      return user.getProducts();
    });
  }

  /**
   * Creates a product
   * @param {Product} product Product to create
   * @returns {Promise} Promise which resolves with the query result
   */
  createProduct(product){
    return this.models.Product.create(product);
  }

  /**
   * Creates store product associations. One association
   * will be created for each store and product, resulting in
   * storeIds.length * productIds.length new records.
   * @param {Array.<Number>} storeIds Ids of the stores
   * @param {Array.<Number>} productIds Ids of the products
   * @returns {Promise} Promise which resolves with the result of the query
   */
  createStoreProducts(storeIds, productIds){
    let self = this;
    let promises = [];
    for (let s = 0; s < storeIds.length; s++){
      let storeId = storeIds[s];
      promises.push(
        this.models.Store.findOne({
          where: {
            id: storeId
          }
        })
        .then(function(store){
          return self.models.Product.findAll({
            where: {
              id: {
                $in: productIds
              }
            }
          })
          .then(function(products){
            store.addProducts(products);
          });
        })
      );
    }
    return Promise.all(promises);
  }
}

module.exports = function(connectionString){
  return new ProductManager(connectionString);
};
