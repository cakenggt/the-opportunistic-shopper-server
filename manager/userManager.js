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

class UserManager {
  constructor(connectionString){
    this.connectionString = connectionString;
  }

  /**
   * Finds a user by their google ID
   * @param {String} id Google id of the user
   * @returns {Promise} Promise which resolves with one User
   */
  findUserByGoogleId(id){
    let self = this;
    return new Promise(function(resolve, reject){
      pg.connect(self.connectionString, function(err, client, done){
        if (err){
          done();
          reject(err);
          return;
        }
        client.query(`
          select *
          from users
          where google_id = $1`, [id],
        function(err, result){
          if (err){
            reject(err);
            done();
            return;
          }
          done();
          resolve(result.rows[0]);
        });
      });
    });
  }

  /**
   * Inserts a new user into the db only if they don't exist already
   * @param {String} id Google id of the user
   * @param {String} email Email of the user
   * @returns {Promise} Promise which resolves with the query result
   */
  createGoogleUserIfNotExists(id, email){
    let self = this;
    return new Promise(function(resolve, reject){
      pg.connect(self.connectionString, function(err, client, done){
        if (err){
          done();
          reject(err);
          return;
        }
        client.query(`
          insert into users (google_id, email)
          select $1, $2
          where not exists
          (
            select id from users
            where google_id = $1
          )`, [id, email],
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
   * Finds a user with a certain Google ID. If they don't
   * exist, then it inserts a new record into the db.
   * @param {String} id Google id of the user
   * @param {String} email Email of the user
   * @returns {Promise} Promise which resolves with one User
   */
  findOrCreateUserByGoogleId(id, email){
    let self = this;
    return this.createGoogleUserIfNotExists(id, email)
    .then(function(){
      return self.findUserByGoogleId(id);
    });
  }

  /**
   * Creates a user store association.
   * @param {UserStore} association Object representation of a
   * user store association
   * @returns {Promise} Promise which resolves with the result of the query
   */
  createUserStoreAssociation(userId, storeId, name){
    let self = this;
    return new Promise(function(resolve, reject){
      pg.connect(self.connectionString, function(err, client, done){
        if (err){
          done();
          reject(err);
          return;
        }
        client.query(`
          insert into user_stores
          (user_id, store_id, name)
          values ($1, $2, $3)`, [userId, storeId, name],
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
}

module.exports = function(connectionString){
  return new UserManager(connectionString);
};
