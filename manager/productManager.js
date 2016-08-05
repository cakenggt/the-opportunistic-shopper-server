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
}

module.exports = function(connectionString){
  return new ProductManager(connectionString);
};
