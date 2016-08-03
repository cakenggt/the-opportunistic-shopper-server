'use strict';

const credentials = require('./credentials');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const http = require('http').Server(app);
const GoogleAuth = require('google-auth-library');
const authFactory = new GoogleAuth();
const oauth2client = new authFactory.OAuth2();
const argv = require('yargs').argv;

const userManager = require('./manager/userManager');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

//custom middleware
if (argv.DEVELOPMENT || argv.DEV || argv.D){
  console.log('Starting in Development mode');
  app.use(function(req, res, next){
    let authorization = req.headers.authorization;
    let token = authorization.split(' ')[1];
    req.profile = {
      sub: token,
      name: token
    };
    next();
  });
}
else{
  app.use(function(req, res, next){
    let authorization = req.headers.authorization;
    let authParts = authorization.split(' ');
    let authType = authParts[0];
    let token = authParts[1];
    if (token){
      switch (authType){
        case 'GOOGLE':
          oauth2client.verifyIdToken(token, credentials.APP_CLIENT_ID, function(err, tokenInfo){
            if (!err){
              req.profile = userManager.findUserByGoogleId(tokenInfo.getPayload().sub);
              next();
            }
            else{
              res.json({
                "errors": ['Invalid token', err.message]
              });
              res.end();
            }
          });
          break;
        default:
          res.json({
            "errors": ['Unknown auth type']
          });
          res.end();
      }
    }
    else{
      console.log(req);
      res.json({
        "errors": ['Missing token']
      });
      res.end();
    }
  });
}

http.listen(credentials.PORT, function(){
  console.log('Example app listening on port', credentials.PORT, '!');
});

//Load the api versions
require('./api/v1')(app);
