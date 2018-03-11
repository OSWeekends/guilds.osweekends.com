// jshint strict:true, node:true, esnext: true, curly:true, maxcomplexity:15, newcap:true
"use strict";

// Config file
const config = require("./config.json");

// Pillars require
const project = require('pillars').configure({
  debug: true,
  renderReload: true
});
// Extract global classes
const {Route, Middleware} = global;

// i18n config
const i18n = project.i18n;
i18n.load('guilds', './languages');
i18n.languages = ['es_ES'];

// Setup default HTTP service
project.services.get('http').configure({port:3000}).start();

// Mongo config
const MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
MongoClient.connect("mongodb://localhost:27017", function(e, client) {
  if(e) {
    console.log("Mongo connect Error.",e);
  } else {
    project.DB = client.db("guilds");
    console.log("Mongo connect Succes.");
  }
});

// Inject MongoDB sessions connector
require("./src/mongoSessions")(project);
// Load passport middleware (Github - Passport - MongoDB connector)
require("./src/mongoPassport")(project);


// Dev view
project.routes.add(new Route({
  path: "/pruebas",
  session: true,  // active sessions
  passport: true, // force automatic PassportGithub login
}, function(gw){
  gw.session.counter = gw.session.counter || 0;
  gw.session.counter++; 
  project.DB.collection("users").find({}).project({}).toArray().then(function(users){
    const userIds = users.map(function(e, i){
      return e.githubId;
    });
    gw.json({
      session: gw.session,
      user: gw.user,
      allUsers : userIds
    }, {deep:0});
  }).catch(function(error){
    gw.error(500, error);
  });
}));

// API
project.routes.add(new Route({
  path: "/api",
  session: true,  // active sessions
  passport: true, // force automatic PassportGithub login
  routes : [
    new Route({
      path : "guilds/:guild/join",
      method: "GET"
    }, function(gw){
      if(ObjectID.isValid(gw.params.guild)){
        project.DB.collection("guilds").update({
          _id:(new ObjectID.createFromHexString(gw.params.guild)),
          users:{$ne:gw.user._id}
        },{
          $push: {users:gw.user._id}
        }).then(function(query){
          if(query.result.nModified != 1){
            gw.statusCode = 406;
            gw.json({error:gw.i18n('pillars.statusCodes',{code:gw.statusCode})});
          } else {
            gw.json({result:1});
          }
        }).catch(function(error){
          gw.statusCode = 500;
          gw.json({error:error});
        });
      } else {
        gw.error(400);
      }
    })
  ]
}));

// Static directory service
project.routes.add(new Route({
  id:'static',
  path:'/*:path',
  directory:{
    path:'./static',
    listing:true
  }
}));

