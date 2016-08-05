'use strict';

const pg = require('pg');

class ProductManager {
  constructor(connectionString){
    this.connectionString = connectionString;
  }

  /**
   * Gets all products that a user has created, both active
   * and crossed off.
   * @param {Number} userId User ID
   * @returns {Promise} Promise which resolves with an array of Products
   */
  findProductsByUser(userId){
    let self = this;
    return new Promise(function(resolve, reject){
      pg.connect(self.connectionString, function(err, client, done){
        if (err){
          done();
          reject(err);
          return;
        }
        client.query(`
          select id, name, description, status
          from products
          where user_id = $1`, [userId],
        function(err, result){
          if (err){
            reject(err);
            done();
            return;
          }
          done();
          resolve(result.rows);
        });
      });
    });
  }

  /**
   * Gets all products that a user has created, both active
   * and crossed off. The products are duplicated in the list
   * once per store that they are associated with that the user
   * is also associated with
   * @param {Number} userId User ID
   * @returns {Promise} Promise which resolves with an array of Products
   * with an additional store_id attribute
   */
  findProductsByUserAndFetchStores(userId){
    let self = this;
    return new Promise(function(resolve, reject){
      pg.connect(self.connectionString, function(err, client, done){
        if (err){
          done();
          reject(err);
          return;
        }
        client.query(`
          select product.id as product_id, product.name,
          product.description, product.status,
          sp.store_id as store_id
          from products product
          left join store_products sp on sp.product_id = product.id
          left join user_stores us on us.store_id = sp.store_id
          where product.user_id = $1
          and us.user_id = $1`, [userId],
        function(err, result){
          if (err){
            reject(err);
            done();
            return;
          }
          done();
          resolve(result.rows);
        });
      });
    });
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
    let query = '';
    for (let s = 0; s < storeIds.length; s++){
      let storeId = storeIds[s];
      for (let p = 0; p < productIds.length; p++){
        let productId = productIds[p];
        query += `
        insert into store_products
        (store_id, product_id) values
        (${storeId}, ${productId});`;
      }
    }
    return new Promise(function(resolve, reject){
      pg.connect(self.connectionString, function(err, client, done){
        if (err){
          done();
          reject(err);
          return;
        }
        client.query(query,
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
   * Deletes store product associations where the store_id is
   * in storeIds AND the product_id is in productIds.
   * @param {Array.<Number>} storeIds Ids of the stores
   * @param {Array.<Number>} productIds Ids of the products
   * @returns {Promise} Promise which resolves with the result of the query
   */
  deleteStoreProducts(storeIds, productIds){
    let self = this;
    return new Promise(function(resolve, reject){
      pg.connect(self.connectionString, function(err, client, done){
        if (err){
          done();
          reject(err);
          return;
        }
        client.query(`
          delete from store_products
          where store_id in ($1)
          and product_id in ($2)`, [storeIds, productIds],
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
}

module.exports = function(connectionString){
  return new ProductManager(connectionString);
};
