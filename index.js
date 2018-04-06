'use strict';

// Config file
const config = require('./config.json');

// Pillars require
const project = require('pillars').configure({
  debug: config.debug,
  renderReload: config.debug,
});
// Extract global classes
const {Route} = global;

// i18n config
const i18n = project.i18n;
i18n.load('guilds', './languages');
i18n.languages = ['es_ES'];

// Setup default HTTP service
project.services.get('http').configure({port: config.port}).start();

// Mongo config
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;

MongoClient.connect(config.mongoURL || 'mongodb://localhost:27017', function(e, client) {
  if (e) {
    console.log('Mongo connect Error.', e);
  } else {
    project.DB = client.db('guilds');
    console.log('Mongo connect Succes.');
  }
});

// Inject MongoDB sessions connector
require('./src/mongoSessions')(project);
// Load passport middleware (Github - Passport - MongoDB connector)
require('./src/mongoPassport')(project);


// API
project.routes.add(new Route({
  path: '/api',
  session: true, // active sessions
  passport: true, // force automatic PassportGithub login
  routes: [
    new Route({
      path: 'guilds/:guild/join',
      method: 'GET',
    }, function(gw) {
      if (ObjectID.isValid(gw.params.guild)) {
        project.DB.collection('guilds').update({
          _id: (ObjectID.createFromHexString(gw.params.guild)),
          guilders: {$ne: gw.user._id},
        }, {
          $push: {guilders: {_id: gw.user._id}},
        }).then(function(query) {
          if (query.result.nModified != 1) {
            // gw.statusCode = 406;
            // gw.json({error:gw.i18n('pillars.statusCodes',{code:gw.statusCode})});
            gw.error(406);
          } else {
            // gw.json({result:1});
            gw.redirect('/guilds');
          }
        }).catch(function(error) {
          // gw.statusCode = 500;
          // gw.json({error:error});
          gw.error(500, error);
        });
      } else {
        gw.error(400);
      }
    }),
  ],
}));

// Guilds view
project.routes.add(new Route({
  path: '/guilds',
  session: true, // active sessions
  passport: true, // force automatic PassportGithub login
}, function(gw) {
  Promise.all([
    project.DB.collection('users').find({}).project({}).toArray(),
    project.DB.collection('guilds').find({}).project({}).toArray(),
  ]).then(function(results) {
    const users = results[0];
    const guilds = results[1];
    gw.render('./templates/home.pug', {
      users: function(_id) {
        return users.find(function(user) {
          return user._id.toString() === _id.toString();
        });
      },
      inGuilders: function(guilders = []) {
        return guilders.find(function(guilder) {
          return guilder._id.toString() === gw.user._id.toString();
        });
      },
      guilds,
    });
  }).catch(function(error) {
    gw.error(500, error);
  });
}));

// Static directory service
project.routes.add(new Route({
  id: 'static',
  path: '/*:path',
  directory: {
    path: './static',
    listing: true,
  },
}));
