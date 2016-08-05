'use strict';

const pg = require('pg');

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
  constructor(connectionString){
    this.connectionString = connectionString;
  }

  /**
   * Gets the stores that are associated with a user and are also
   * within a certain radius of a location.
   * @param {Number} userId User ID
   * @param {Location} location Location object
   * @returns {Promise} Promise which resolves with Array.<Store>
   */
  findStoresWithinRadiusOfUser(userId, location, radius){
    let self = this;
    return new Promise(function(resolve, reject){
      pg.connect(self.connectionString, function(err, client, done){
        if (err){
          done();
          reject(err);
          return;
        }
        client.query(`
          select store.id as id,
          st_x(store.location::geometry) as latitude,
          st_y(store.location::geometry) as longitude,
          us.name as name, store.created_by_user_id as created_by_user_id
          from user_stores us
          left join stores store on store.id = us.store_id
          where us.user_id = $1 and
          st_distance(st_geogfromtext('POINT('||$3||' '||$2||')'), store.location) <= $4`,
        [userId, location.latitude, location.longitude, radius],
        function(err, result){
          if (err){
            reject(err);
            done();
            return;
          }
          done();
          let ret = [];
          let rows = result.rows;
          for (let r = 0; r < rows.length; r++){
            ret.push(rows[r].id);
          }
          resolve(ret);
        });
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
    let self = this;
    return new Promise(function(resolve, reject){
      pg.connect(self.connectionString, function(err, client, done){
        if (err){
          done();
          reject(err);
          return;
        }
        client.query(`
          select store.id as id,
          st_x(store.location::geometry) as latitude,
          st_y(store.location::geometry) as longitude,
          store.name as name, store.created_by_user_id as created_by_user_id
          from stores store
          where st_distance(st_geogfromtext('POINT('||$2||' '||$1||')'), store.location) <= $3`,
        [location.latitude, location.longitude, radius],
        function(err, result){
          if (err){
            reject(err);
            done();
            return;
          }
          done();
          let ret = [];
          let rows = result.rows;
          for (let r = 0; r < rows.length; r++){
            ret.push(rows[r].id);
          }
          resolve(ret);
        });
      });
    });
  }

  /**
   * Creates a store
   * @param {String} name Store name
   * @param {Location} location Location object
   * @param {Number} userId Created by user id
   * @returns {Promise} Promise which resolves with the query result
   */
  createStore(name, location, userId){
    let self = this;
    return new Promise(function(resolve, reject){
      pg.connect(self.connectionString, function(err, client, done){
        if (err){
          done();
          reject(err);
          return;
        }
        client.query(`
          insert into stores (name, location, created_by_user_id)
          values ($1, st_geogfromtext('POINT('||$3||' '||$2||')'), $4)`,
        [name, location.latitude, location.longitude, userId],
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
   * Updates a store record.
   * @param {Store} store Object representation of the store to update
   * @returns {Promise} Promise which resolves with the result of the query
   */
  updateStore(store){
    let self = this;
    return new Promise(function(resolve, reject){
      pg.connect(self.connectionString, function(err, client, done){
        if (err){
          done();
          reject(err);
          return;
        }
        client.query(`
          update stores
          set name = $1,
          location = st_geogfromtext('POINT('||$3||' '||$2||')'),
          created_by_user_id = $4
          where id = $5`,
        [store.name, store.latitude,
        store.longitude, store.created_by_user_id, store.id],
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
   * Finds a user store association
   * @param {Number} userId Id of the user.
   * @returns {Promise} Promise which resolves with Array.<Store>
   */
  findStoresByUser(userId){
    let self = this;
    return new Promise(function(resolve, reject){
      pg.connect(self.connectionString, function(err, client, done){
        if (err){
          done();
          reject(err);
          return;
        }
        client.query(`
          select store.id as id,
          st_x(store.location::geometry) as latitude,
          st_y(store.location::geometry) as longitude,
          us.name as name,
          store.created_by_user_id as created_by_user_id
          from user_stores us
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
   * Finds all stores which the user is associated with. The stores
   * are duplicated in the list, once for each product the user
   * has said is at the store.
   * @param {Number} userId Id of the user.
   * @returns {Promise} Promise which resolves with an array of Stores
   * with an additional product_id attribute
   */
  findStoresByUserAndFetchProducts(userId){
    let self = this;
    return new Promise(function(resolve, reject){
      pg.connect(self.connectionString, function(err, client, done){
        if (err){
          done();
          reject(err);
          return;
        }
        client.query(`
          select store.id as store_id, us.name,
          st_x(store.location::geometry) as latitude,
          st_y(store.location::geometry) as longitude,
          product.id as product_id
          from stores store
          left join store_products sp on sp.store_id = store.id
          left join products product on product.id = sp.product_id
          left join user_stores us on us.store_id = store.id
          where (product.user_id is null or product.user_id = $1)
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
  return new StoreManager(connectionString);
};
