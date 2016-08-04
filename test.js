'use strict';
/*jshint expr: true*/
/*jslint mocha: true*/

let credentials = require('./credentials');
//Sets the environment variable for database url to test db
process.env.DATABASE_URL = credentials.TEST_DATABASE_URL;
//remove the import from credentials since it has an incorrect db url
credentials = null;

var expect = require('chai').expect;
const userDao = require('./dao/userDao');
const storeDao = require('./dao/storeDao');

//test objects
const testUser = {
  google_id: 'testUserGoogleId',
  email: 'testUserEmail'
};
let testUserId;
const testStore1 = {
  name: 'test store 1',
  location: {
    latitude: 51.04,
    longitude: 36.09
  }
};
let testStore1Id;

before(function(){
  //reset the test db
  return require('./create_db').createDB();
});
describe('user dao', function(){
  it('user doesn\'t exist', function(){
    return userDao.findUserByGoogleId(testUser.google_id)
    .then(function(result){
      expect(result).to.not.exist;
    });
  });
  it('create user', function(){
    return userDao.createGoogleUserIfNotExists(testUser.google_id, testUser.email);
  });
  it('find user by google id', function(){
    return userDao.findUserByGoogleId(testUser.google_id)
    .then(function(result){
      expect(result.email).to.equal(testUser.email);
      expect(result.google_id).to.equal(testUser.google_id);
      expect(result.id).to.exist;
      testUserId = result.id;
    });
  });
});
describe('store dao', function(){
  it('create store', function(){
    return storeDao.createStore(testStore1.name, testStore1.location, testUserId);
  });
});
