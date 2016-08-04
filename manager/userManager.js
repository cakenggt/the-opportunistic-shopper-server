'use strict';

const pg = require('pg');

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
        client.query("select * "+
        "from users "+
        "where google_id = $1", [id],
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
        client.query("insert into users (google_id, email) "+
        "select $1, $2 "+
        "where not exists "+
        "(select id from users where google_id = $1); ", [id, email],
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
}

module.exports = function(connectionString){
  return new UserManager(connectionString);
};
