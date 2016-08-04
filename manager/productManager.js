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
  getProductsByUser(userId){
    let self = this;
    return new Promise(function(resolve, reject){
      pg.connect(self.connectionString, function(err, client, done){
        if (err){
          done();
          reject(err);
          return;
        }
        client.query("select id, name, description, status "+
        "from products "+
        "where user_id = $1", [userId],
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
