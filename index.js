// jshint strict:true, node:true, esnext: true, camelcase:true, curly:true, maxcomplexity:15, newcap:true
"use strict";

const config = require("./config.json");

// Pillars require
const project = require('pillars').configure({
  debug: true,
  renderReload: true
});
const {Route, Middleware} = global;

const i18n = project.i18n;
i18n.load('guilds', './languages');
i18n.languages = ['es_ES'];

// Setup default HTTP service
project.services.get('http').configure({port:3000}).start();


// Mongo config
const MongoClient = require('mongodb').MongoClient;
let DB = false;
MongoClient.connect("mongodb://localhost:27017", function(e, client) {
  if(e) {
    console.log("Mongo connect Error.",e);
  } else {
    DB = client.db("guilds");
    console.log("Mongo connect Succes.");
  }
});




// Passport requires
const passport = require('passport');
const GithubStrategy = require('passport-github2').Strategy;

// Passport Facebook strategy

const GITHUB_CLIENT_ID = config.githubClientId;
const GITHUB_CLIENT_SECRET = config.githubSecret;
const GITHUB_CALLBACK = "http://localhost:3000/login";
passport.use(new GithubStrategy({
    clientID: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
    callbackURL: GITHUB_CALLBACK 
  },function(accessToken, refreshToken, profile, done) {
    const users = DB.collection("users");
    users.findOneAndUpdate(
        {
          githubId : profile.id
        }, {
          $set:{
            githubId : profile.id,
            githubProfile: profile
          },
          $push : {logins:Date.now()}
        }, {
          upsert : true,
          returnOriginal: false
        }, function(error, result){
          return done(error, result.value); // Object.assign(profile,result.value)
        }
    );
  }
));

// Passport session serialize (RAW)
passport.serializeUser(function(user, done) {
  done(null, user);
});
passport.deserializeUser(function(id, done) {
  done(null, id);
});


// Apply classic Connect middleware as Pillars middleware (Basic, only naming middleware)
project.middleware.add(new Middleware({id:"passportInitialize"},passport.initialize()));
project.middleware.add(new Middleware({id:"passportSession"},passport.session()));

const loginRedirectPath = "/info";

// Login
project.routes.add(new Route({
  id: 'login',
  path:'/login',
  session: true
},
  // Add strategy middleware
  passport.authenticate('github',{ successRedirect: '/info', failureRedirect: loginRedirectPath })
));


// Login redirect
project.routes.add(new Route({
  id: 'login',
  path: loginRedirectPath,
  session: true
}, function(gw){

  getAllUsers().then(function(users){
    const userIds = users.map(function(e, i){
      return e.githubId;
    });
    gw.json({
      session: gw.session,
      allUsers : userIds
    }, {deep:0});
  }).catch(function(error){
    gw.error(error);
  });
  
}
));


// Static directory service
project.routes.add(new Route({
  id:'static',
  path:'/*:path',
  directory:{
    path:'./static',
    listing:true
  }
}));

function getAllUsers(){
  return new Promise(function (resolve, reject) {
    DB.collection("users").find({}).project({}).toArray(function(error, docs) {
      if(!error){
        resolve(docs);
      } else {
        reject(error);
      }
    });
  });
}