'use strict';

const userDao = require('../dao/userDao');

exports.findUserByGoogleId = function(id){
  return userDao.findUserByGoogleId(id);
};
