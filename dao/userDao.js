'use strict';

const pg = require('pg');
const credentials = require('../credentials');

/**
 * Finds a user by their google ID
 * @param {String} id Google id of the user
 * @returns {Promise} Promise Promise which resolves with one User
 */
exports.findUserByGoogleId = function(id){
  return new Promise(function(resolve, reject){
    pg.connect(credentials.DATABASE_URL, function(err, client, done){
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
};

/**
 * Inserts a new user into the db only if they don't exist already
 * @param {String} id Google id of the user
 * @param {String} email Email of the user
 * @returns {Promise} Promise which resolves with the query result
 */
exports.createGoogleUserIfNotExists = function(id, email){
  return new Promise(function(resolve, reject){
    pg.connect(credentials.DATABASE_URL, function(err, client, done){
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
};
