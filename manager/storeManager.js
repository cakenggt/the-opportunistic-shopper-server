'use strict';

const pg = require('pg');

class StoreManager {
  constructor(connectionString){
    this.connectionString = connectionString;
  }

  /**
   * Gets the stores that are associated with a user and are also
   * within a certain radius of a location.
   * @param {Number} userId User ID
   * @param {Object} location Location object
   * @param {Number} location.latitude Latitude value
   * @param {Number} location.longitude Longitude value
   * @param {Number} radius Radius in meters
   * @returns {Promise} Promise which resolves with an array of store ids
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
        client.query("select store.id as id "+
        "from user_stores us "+
        "left join stores store on store.id = us.store_id "+
        "where us.user_id = $1 and "+
        "st_distance(st_geogfromtext('POINT('||$3||' '||$2||')'), store.location) <= $4",
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
   * @param {Object} location Location object
   * @param {Number} location.latitude Latitude value
   * @param {Number} location.longitude Longitude value
   * @param {Number} radius Radius in meters
   * @returns {Promise} Promise which resolves with an array of store ids
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
        client.query("select store.id as id "+
        "from stores store "+
        "where st_distance(st_geogfromtext('POINT('||$2||' '||$1||')'), store.location) <= $3",
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
   * @param {Object} location Location object
   * @param {Number} location.latitude Latitude value
   * @param {Number} location.longitude Longitude value
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
        client.query("insert into stores (name, location, created_by_user_id) "+
        "values ($1, st_geogfromtext('POINT('||$3||' '||$2||')'), $4)",
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
        client.query("update stores "+
        "set name = $1, location = st_geogfromtext('POINT('||$3||' '||$2||')'), "+
        "created_by_user_id = $4 "+
        "where id = $5",
        [store.name, store.location.latitude,
        store.location.longitude, store.created_by_user_id, store.id],
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
   * @returns {Promise} Promise which resolves with a list of objects which
   * have a name and store_id property, representing the stores associated with
   * this user and the user's names for them.
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
        client.query("select us.name, us.store_id "+
        "from user_stores us "+
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
  return new StoreManager(connectionString);
};
