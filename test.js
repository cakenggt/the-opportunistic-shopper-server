'use strict';
/*jshint expr: true*/
/*jslint mocha: true*/

let credentials = require('./credentials');
const Sequelize = require('sequelize');
const db = new Sequelize(credentials.TEST_DATABASE_URL, {
  logging: true
});
const models = db.import(__dirname + '/models');

var expect = require('chai').expect;
const userManager = require('./manager/userManager')(models);
const storeManager = require('./manager/storeManager')(models);
const productManager = require('./manager/productManager')(models);

//test objects
const testUser = {
  googleId: 'testUserGoogleId',
  email: 'testUserEmail@email.com'
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
const testStore2 = {
  name: 'test store 2',
  location: {
    latitude: 51.04,
    longitude: 36.09
  }
};
let testStore2Id;
const testProduct1 = {
  name: 'testProduct1',
  description: 'test product description',
  status: 'ACTIVE',
  sponsored: false
};
let testProduct1Id;

before(function(){
  //reset the test db
  return models.User.sync({force: true})
  .then(function(){
    return models.Store.sync({force: true});
  })
  .then(function(){
    return models.UserStore.sync({force: true});
  })
  .then(function(){
    return models.Product.sync({force: true});
  })
  .then(function(){
    return models.StoreProduct.sync({force: true});
  });
});

describe('user manager', function(){
  it('user doesn\'t exist', function(){
    return userManager.findUserByGoogleId(testUser.googleId)
    .then(function(user){
      expect(user).to.not.exist;
    });
  });
  it('create user', function(){
    return userManager.findOrCreateUserByGoogleId(testUser.googleId, testUser.email);
  });
  it('find user by google id', function(){
    return userManager.findUserByGoogleId(testUser.googleId)
    .then(function(result){
      let user = result.get({
        plain: true
      });
      expect(user.email).to.equal(testUser.email);
      expect(user.googleId).to.equal(testUser.googleId);
      expect(user.id).to.exist;
      testUserId = user.id;
      testProduct1.userId = testUserId;
    });
  });
});

describe('store manager', function(){
  it('create store', function(){
    return storeManager.createStore(testStore1.name, testStore1.location, testUserId)
    .then(function(result){
      testStore1Id = result.dataValues.id;
      return storeManager.createStore(testStore2.name, testStore2.location, testUserId);
    })
    .then(function(result){
      testStore2Id = result.dataValues.id;
      return storeManager.findStoresWithinRadiusOfLocation(testStore1.location, 5)
      .then(function(result){
        expect(result[0]).to.exist;
        let store = result[0].get({
          plain: true
        });
        expect(store.id).to.equal(testStore1Id);
      })
      .then(function(){
        let wrongLoc = {
          latitude: testStore1.location.latitude+1,
          longitude: testStore1.location.longitude+1
        };
        return storeManager.findStoresWithinRadiusOfLocation(wrongLoc, 5)
        .then(function(result){
          expect(result).to.have.length.equals(0);
        });
      });
    });
  });
  it('create user_store', function(){
    return userManager.createUserStoreAssociation(testUserId, testStore1Id, testStore1.name + ' association');
  });
  it('get stores within radius of user', function(){
    let customName = testStore1.name + ' association';
    return storeManager.findStoresWithinRadiusOfUser(testUserId, testStore1.location, 5)
    .then(function(result){
      expect(result[0]).to.exist;
      let store = result[0].get({
        plain: true
      });
      expect(store.id).to.equal(testStore1Id);
      expect(store.userStore.name).to.equal(customName);
    });
  });
});
describe('product manager', function(){
  it('create product', function(){
    return productManager.createProduct(testProduct1)
    .then(function(){
      return productManager.findProductsByUser(testUserId)
      .then(function(result){
        expect(result[0]).to.exist;
        let product = result[0].get({
          plain: true
        });
        testProduct1Id = product.id;
      });
    });
  });
  it('associate with test store 1', function(){
    return productManager.createStoreProducts([testStore1Id], [testProduct1Id]);
  });
});
describe('api', function(){
  describe('v1', function(){
    it('/all', function(){
      return userManager.getCompleteStoreAndProductDataByUser(testUserId)
      .then(function(result){
        expect(result.products).to.exist;
        expect(result.products.ids).to.have.length.gt(0);
        expect(result.products.data[testProduct1Id]).to.exist;
        expect(result.products.data[testProduct1Id].description).to.equal(testProduct1.description);
        expect(result.stores).to.exist;
        expect(result.stores.ids).to.have.length.gt(0);
        expect(result.stores.data[testStore2Id]).to.not.exist;
        expect(result.stores.data[testStore1Id]).to.exist;
        expect(result.stores.data[testStore1Id].name).to.equal(testStore1.name);
      });
    });
  });
});
