// jshint strict:true, node:true, esnext: true, curly:true, maxcomplexity:15, newcap:true
"use strict";

var ObjectID = require('mongodb').ObjectID;

require('json.crypt');
JSON.cryptPassword = "3zTvzr3p67VC61jmV54rIYu1545x4TlY";

module.exports = function(project){
  const sessionsMiddleware = project.middleware.get("Sessions");

  sessionsMiddleware.getSession = function(gw,callback){
    // Check cookie for session id+key, if not, create a new session and send session cookie.
    if(!gw.cookie.sid) {
      sessionsMiddleware.newSession(gw,callback);
    } else {
      var sid = gw.cookie.sid = JSON.decrypt(gw.cookie.sid);
      if(sid && sid.id && /^[a-f0-9]{24}$/i.test(sid.id)){
        var sessions = project.DB.collection('sessions');
        var _id = new ObjectID.createFromHexString(sid.id);
        sessions.findOne({_id:_id,key:sid.key},function(error, result) {
          if(!error && result){
            gw.session = result.session;
            callback();
          } else {
            sessionsMiddleware.newSession(gw,callback);
          }
        });
      } else {
        sessionsMiddleware.newSession(gw,callback);
      }
    }
  };

  sessionsMiddleware.newSession = function(gw,callback){
    // Create a new session on database.
    var sessions = project.DB.collection('sessions');
    var key = Math.round(Math.random()*100000000000000000000000000000).toString(36);
    sessions.insertOne({timestamp:(new Date()),lastaccess:(new Date()),key:key},function(error, result) {
      if(!error && result.insertedCount == 1){
        gw.cookie.sid = {
          id:result.insertedId.toString(),
          key:key
        };
        gw.setCookie('sid',JSON.encrypt(gw.cookie.sid),{maxAge:365*24*60*60});
        gw.session = {};
        callback();
      } else {
        callback(error);
      }
    });
  };

  sessionsMiddleware.saveSession = function(gw,meta,done){
    // Save gw.session Objet on database.
    var sid = gw.cookie.sid || false;
    if(gw.session && sid && sid.id && /^[a-f0-9]{24}$/i.test(sid.id)){
      sid = new ObjectID.createFromHexString(sid.id);
      var sessions = project.DB.collection('sessions');
      sessions.updateOne({_id:sid},{$set:{session:gw.session,lastaccess:(new Date())}},function(error, result) {
        if(!error && result.modifiedCount == 1){
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