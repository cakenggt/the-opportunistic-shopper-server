'use strict';
/*jshint expr: true*/
/*jslint mocha: true*/

let credentials = require('./credentials');

var expect = require('chai').expect;
const userManager = require('./manager/userManager')(credentials.TEST_DATABASE_URL);
const storeManager = require('./manager/storeManager')(credentials.TEST_DATABASE_URL);
const productManager = require('./manager/productManager')(credentials.TEST_DATABASE_URL);

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
  return require('./create_db').createDB(credentials.TEST_DATABASE_URL);
});
describe('user dao', function(){
  it('user doesn\'t exist', function(){
    return userManager.findUserByGoogleId(testUser.google_id)
    .then(function(result){
      expect(result).to.not.exist;
    });
  });
  it('create user', function(){
    return userManager.createGoogleUserIfNotExists(testUser.google_id, testUser.email);
  });
  it('find user by google id', function(){
    return userManager.findUserByGoogleId(testUser.google_id)
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
    return storeManager.createStore(testStore1.name, testStore1.location, testUserId)
    .then(function(){
      return storeManager.findStoresWithinRadiusOfLocation(testStore1.location, 5)
      .then(function(result){
        expect(result[0]).to.exist;
        testStore1Id = result[0];
      });
    });
  });
  it('create user_store', function(){
    return userManager.createUserStoreAssociation(testUserId, testStore1Id, testStore1.name);
  });
  it('get stores within radius of user', function(){
    return storeManager.findStoresWithinRadiusOfUser(testUserId, testStore1.location, 5)
    .then(function(result){
      expect(result[0]).to.equal(testStore1Id);
    });
  });
});
