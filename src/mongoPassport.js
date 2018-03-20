'use strict';

const config = require('../config.json');
const passport = require('passport');
const GithubStrategy = require('passport-github2').Strategy;
const {Route, Middleware} = global;

module.exports = function(project) {
  passport.use(new GithubStrategy({
      clientID: config.githubClientId,
      clientSecret: config.githubSecret,
      callbackURL: 'http://' + config.hostname + ':' + config.port + '/login',
    }, function(accessToken, refreshToken, profile, done) {
      const users = project.DB.collection('users');
      users.findOneAndUpdate(
          {
            githubId: profile.id,
          }, {
            $set: {
              githubToken: accessToken,
              githubRefreshToken: refreshToken,
              githubProfile: profile,
            },
            $push: {logins: Date.now()},
          }, {
            upsert: true,
            returnOriginal: false,
          }, function(error, result) {
            return done(error, result.value);
          }
      );
    }
  ));

  // Passport session serialize (RAW)
  passport.serializeUser(function(user, done) {
    done(null, user.githubId);
  });
  passport.deserializeUser(function(githubId, done) {
    const users = project.DB.collection('users');
    users.findOne({githubId}, function(error, result) {
      done(error, result);
    });
  });


  // Apply classic Connect middleware as Pillars middleware (Basic, only naming middleware)
  project.middleware.add(new Middleware({id: 'passportInitialize'}, passport.initialize()));
  project.middleware.add(new Middleware({id: 'passportSession'}, passport.session()));
  project.middleware.add(new Middleware({id: 'passportCheck'}, function(gw, done) {
    const checkPassport = gw.routing.check('passport', undefined);
    if (checkPassport) {
      if (!gw.session) {
        throw new Error('Passport middleware require a session');
      } else {
        if (!gw.session.passport) {
          gw.session.redirect = gw.path;
          gw.redirect('/login', 302);
        } else {
          done();
        }
      }
    } else {
      done();
    }
  }));

  const loginSuccessPath = '/login-success';
  const loginErrorPath = '/login-error';

  // Login
  project.routes.add(new Route({
    id: 'loginPassport',
    path: '/login',
    session: true,
  },
    // Add strategy middleware
    passport.authenticate('github', {successRedirect: loginSuccessPath, failureRedirect: loginErrorPath})
  ));


  // Login success
  project.routes.add(new Route({
    id: 'loginSuccess',
    path: loginSuccessPath,
    session: true,
  }, function(gw) {
    if (gw.session.redirect) {
      gw.redirect(gw.session.redirect, 302);
      gw.session.redirect = undefined;
    } else {
      gw.redirect('/', 302);
    }
  }));

  // Login error
  project.routes.add(new Route({
    id: 'loginError',
    path: loginErrorPath,
    session: true,
  }, function(gw) {
    console.log('loginError:', gw);
    gw.error(401);
  }));
};
