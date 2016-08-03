'use strict';

const pg = require('pg');
const credentials = require('./credentials');

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
      "where id = $1", [id],
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
