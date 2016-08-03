'use strict';

const pg = require('pg');
const credentials = require('./credentials');

exports.getStoresByUser = function(userId){
  return new Promise(function(resolve, reject){
    pg.connect(credentials.DATABASE_URL, function(err, client, done){
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
};

exports.getStoresWithinRadiusOfUser = function(userId, location, radius){
  return new Promise(function(resolve, reject){
    pg.connect(credentials.DATABASE_URL, function(err, client, done){
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
      "st_distance(st_geogfromtext(‘POINT(?3, ?2)’), store.location) <= ?4",
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
};
