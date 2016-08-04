'use strict';

const pg = require('pg');

class StoreManager {
  constructor(connectionString){
    this.connectionString = connectionString;
  }

  /**
   * Gets the stores that a user is associated with.
   * @param {Number} userId User ID
   * @returns {Promise} Promise which resolves with an array of Stores
   */
  getStoresByUser(userId){
    let self = this;
    return new Promise(function(resolve, reject){
      pg.connect(self.connectionString, function(err, client, done){
        if (err){
          done();
          reject(err);
          return;
        }
        client.query("select store.id, store.name, st_asgeojson(store.location) as location "+
        "from users user "+
        "left join user_stores us on us.user_id = user.id "+
        "left join stores store on store.id = us.store_id "+
        "where user.id = $1", [userId],
        function(err, result){
          if (err){
            reject(err);
            done();
            return;
          }
          done();
          let rows = result.rows;
          //parse json for location
          for (let r = 0; r < rows.length; r++){
            let row = rows[r];
            row.location = JSON.parse(row.location);
            rows[r] = row;
          }
          resolve(rows);
        });
      });
    });
  }

  /**
   * Gets the stores that are associated with a user and are also
   * within a certain radius of a location.
   * @param {Number} userId User ID
   * @param {Object} location Location object
   * @param {Number} location.latitude Latitude value
   * @param {Number} location.longitude Longitude value
   * @param {Number} radius Radius in meters
   * @returns {Promise} Promise which resolves with an array of Stores
   */
  getStoresWithinRadiusOfUser(userId, location, radius){
    let self = this;
    return new Promise(function(resolve, reject){
      pg.connect(self.connectionString, function(err, client, done){
        if (err){
          done();
          reject(err);
          return;
        }
        client.query("select store.id "+
        "from stores store "+
        "left join user_stores us on us.store_id = store.id "+
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
          let rows = result.rows;
          resolve(rows);
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
}

module.exports = function(connectionString){
  return new StoreManager(connectionString);
};
