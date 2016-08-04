'use strict';
/*jshint expr: true*/
/*jslint mocha: true*/

//Sets the environment variable for database url to test db
process.env.DATABASE_URL = "postgres:postgres:postgres@localhost:5432/theOpportunisticShopperTest";

var expect = require('chai').expect;
const userDao = require('./dao/userDao');

//test objects
const testUser = {
  google_id: 'testUserGoogleId',
  email: 'testUserEmail'
};

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
    });
  });
});
