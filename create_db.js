'use strict';
/*jslint node: true */

const credentials = require('./credentials');
const pg = require('pg');

function createDB(connectionString){
  return new Promise(function(resolve, reject){
    pg.connect(connectionString, function(err, client, done){
      if (err){
        return console.error('error fetching client from pool', err);
      }
      client.query("drop table if exists store_products", function(err){
        if (err){
          console.error('error', err);
          return;
        }
        client.query("drop table if exists user_stores", function(err){
          if (err){
            console.error('error', err);
            return;
          }
          client.query("drop table if exists products", function(err){
            if (err){
              console.error('error', err);
              return;
            }
            client.query("drop table if exists stores", function(err){
              if (err){
                console.error('error', err);
                return;
              }
              client.query("drop table if exists users", function(err){
                if (err){
                  console.error('error', err);
                  return;
                }
                createUser(client, function(err){
                  if (err){
                    console.error('error', err);
                    return;
                  }
                  createStore(client, function(err){
                    if (err){
                      console.error('error', err);
                      return;
                    }
                    createProduct(client, function(err){
                      if (err){
                        console.error('error', err);
                        return;
                      }
                      createUserStore(client, function(err){
                        if (err){
                          console.error('error', err);
                          return;
                        }
                        createStoreProduct(client, function(err){
                          if (err){
                            console.error('error', err);
                            return;
                          }
                          done();
                          pg.end();
                          resolve();
                        });
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  });
}
exports.createDB = createDB;


function createUser(client, callback){
  client.query("create table users ( "+
  "id serial primary key, "+
  "email text, "+
  "google_id text)", callback);
}

function createStore(client, callback){
  client.query("create table stores ( "+
  "id serial primary key, "+
  "name text, "+
  "location geography, "+
  "created_by_user_id integer references users)", callback);
}

function createProduct(client, callback){
  client.query("create table products ( "+
  "id serial primary key, "+
  "name text, "+
  "description text, "+
  "user_id integer references users, "+
  "status text, "+
  "sponsored boolean)", callback);
}

function createUserStore(client, callback){
  client.query("create table user_stores ( "+
  "id serial primary key, "+
  "user_id integer references users, "+
  "store_id integer references stores, "+
  "name text)", callback);
}

function createStoreProduct(client, callback){
  client.query("create table store_products ( "+
  "id serial primary key, "+
  "store_id integer references stores, "+
  "product_id integer references products)", callback);
}

if (require.main === module){
  createDB(credentials.DATABASE_URL);
}
