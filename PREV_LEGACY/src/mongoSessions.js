'use strict';

let ObjectID = require('mongodb').ObjectID;

const config = require('../config.json');
if (config.crypt) {
  require('json.crypt');
  JSON.cryptPassword = config.crypt;
}

module.exports = function(project) {
  const sessionsMiddleware = project.middleware.get('Sessions');

  sessionsMiddleware.getSession = function(gw, callback) {
    // Check cookie for session id+key, if not, create a new session and send session cookie.
    if (!gw.cookie.sid) {
      sessionsMiddleware.newSession(gw, callback);
    } else {
      let sid = gw.cookie.sid = JSON.decrypt(gw.cookie.sid);
      if (sid && sid.id && /^[a-f0-9]{24}$/i.test(sid.id)) {
        let sessions = project.DB.collection('sessions');
        let _id = ObjectID.createFromHexString(sid.id);
        sessions.findOne({_id: _id, key: sid.key}, function(error, result) {
          if (!error && result) {
            gw.session = result.session;
            callback();
          } else {
            sessionsMiddleware.newSession(gw, callback);
          }
        });
      } else {
        sessionsMiddleware.newSession(gw, callback);
      }
    }
  };

  sessionsMiddleware.newSession = function(gw, callback) {
    // Create a new session on database.
    let sessions = project.DB.collection('sessions');
    let key = Math.round(Math.random()*100000000000000000000000000000).toString(36);
    sessions.insertOne({timestamp: (new Date()), lastaccess: (new Date()), key: key}, function(error, result) {
      if (!error && result.insertedCount == 1) {
        gw.cookie.sid = {
          id: result.insertedId.toString(),
          key: key,
        };
        gw.setCookie('sid', JSON.encrypt(gw.cookie.sid), {maxAge: 365*24*60*60});
        gw.session = {};
        callback();
      } else {
        callback(error);
      }
    });
  };

  sessionsMiddleware.saveSession = function(gw, meta, done) {
    // Save gw.session Objet on database.
    let sid = gw.cookie.sid || false;
    if (gw.session && sid && sid.id && /^[a-f0-9]{24}$/i.test(sid.id)) {
      sid = ObjectID.createFromHexString(sid.id);
      let sessions = project.DB.collection('sessions');
      sessions.updateOne({_id: sid}, {$set: {session: gw.session, lastaccess: (new Date())}}, function(error, result) {
        if (!error && result.modifiedCount == 1) {
          // Session saved
          done();
        } else {
          done(error);
        }
      });
    } else {
      done(new Error('Unable to save the session, no SID or empty session.'));
    }
  };
};
