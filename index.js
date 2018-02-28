
var config = require("./config.json");

// Passport requires
var passport = require('passport');
var GithubStrategy = require('passport-github2').Strategy;

// Passport Facebook strategy

var GITHUB_CLIENT_ID = config.githubClientId;
var GITHUB_CLIENT_SECRET = config.githubSecret;
var GITHUB_CALLBACK = "http://localhost:3000/passport/github";
passport.use(new GithubStrategy({
    clientID: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
    callbackURL: GITHUB_CALLBACK 
  },function(accessToken, refreshToken, profile, done) {
    done(null, profile);
  }
));

// Passport session serialize (RAW)
passport.serializeUser(function(user, done) {
  done(null, user);
});
passport.deserializeUser(function(id, done) {
  done(null, id);
});


// Pillars require
var project = require('pillars').configure({
  debug: true,
  renderReload: true
});

var i18n = project.i18n;
i18n.load('guilds', './languages');
i18n.languages = ['es_ES'];

// Setup default HTTP service
project.services.get('http').configure({timeout:8000,port:3000}).start();

// Apply classic Connect middleware as Pillars middleware (Basic, only naming middleware)
project.middleware.add(Middleware({id:"passportInitialize"},passport.initialize()));
project.middleware.add(Middleware({id:"passportSession"},passport.session()));



// Create new Route container
var PassportCtrl = Route({
    id: 'passport',
    path:'/passport',
    method:["get"],
    session: true    // All sub-routes inherited session support
  },
  function(gw){
    // Show links to login options:
    gw.html(
      '<a href="/passport/github">Github login</a>'
    );
  }
);

// Login success, shows the session.
PassportCtrl.routes.add(Route({
  path:'/view-session',
  session: true
}, function(gw){
  gw.json(gw.session,{deep:0});
}));

// Passport Github strategy login controller
PassportCtrl.routes.add(Route({
  id: 'github',
  path:'/github',
  method:["get"]
},
// Add strategy middleware
passport.authenticate('github',{ successRedirect: '/passport/view-session', failureRedirect: '/passport?error=facebook' })
));

// Finally add the Passport controller to the project
// You can create a Passport login system and encapsulate as only one Route/Component, and use on any project.
project.routes.add(PassportCtrl);

project.routes.add(Route({
  id:'static',
  path:'/*:path',
  directory:{
    path:'./static',
    listing:true
  }
}));