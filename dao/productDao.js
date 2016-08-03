'use strict';

const pg = require('pg');
const credentials = require('./credentials');

exports.getProductsByUser = function(userId){
  return new Promise(function(resolve, reject){
    pg.connect(credentials.DATABASE_URL, function(err, client, done){
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
};
