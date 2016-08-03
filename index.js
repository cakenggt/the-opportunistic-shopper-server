'use strict';

const credentials = require('./credentials');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const pg = require('pg');
const http = require('http').Server(app);
const GoogleAuth = require('google-auth-library');
const authFactory = new GoogleAuth();
const oauth2client = new authFactory.OAuth2();
const argv = require('yargs').argv;

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

//custom middleware
if (argv.DEVELOPMENT || argv.DEV || argv.D){
  console.log('Starting in Development mode');
  app.use(function(req, res, next){
    req.profile = {
      sub: req.body.token,
      name: req.body.token
    };
    next();
  });
}
else{
  app.use(function(req, res, next){
    let token = req.headers.authorization;
    if (token){
      oauth2client.verifyIdToken(token, credentials.APP_CLIENT_ID, function(err, tokenInfo){
        if (!err){
          req.profile = tokenInfo.getPayload();
          next();
        }
        else{
          res.json({
            "errors": ['Invalid token', err.message]
          });
          res.end();
        }
      });
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
