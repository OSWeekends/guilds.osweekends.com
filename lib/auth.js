const passport = require( 'passport' ),
  GitHubStrategy = require( 'passport-github2' ).Strategy,
  logger = require( './logger' ),
  config = require( '../config' );

// Passport session setup.
passport.serializeUser(( user, done ) => done( null, user ));
passport.deserializeUser(( obj, done ) => done( null, obj ));


// Use the GitHubStrategy within Passport.
passport.use( new GitHubStrategy({
  clientID: config.github.clientID,
  clientSecret: config.github.clientSecret,
  callbackURL: config.github.callback
},
( accessToken, refreshToken, profile, done ) => {
  logger.info( `[INFO][PASSPORT] 
        accessToken: ${accessToken}, 
        refreshToken: ${refreshToken}, 
        profile: ${profile}` );
  process.nextTick(() => done( null, profile ));
}
));

function ensureAuthenticated( req, res, next ) {
  if ( req.isAuthenticated()) {
    return next();
  }
  res.redirect( '/login' );
}

module.exports = { passport, ensureAuthenticated }
