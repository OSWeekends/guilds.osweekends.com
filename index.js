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
/* Comentada conexión BDD para desing
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
*/

// Inject MongoDB sessions connector
// require("./src/mongoSessions")(project);
// Load passport middleware (Github - Passport - MongoDB connector)
// require("./src/mongoPassport")(project);




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
      gw.redirect("/guilds");
      /*
      if(ObjectID.isValid(gw.params.guild)){
        project.DB.collection("guilds").update({
          _id:(new ObjectID.createFromHexString(gw.params.guild)),
          guilders:{$ne:gw.user._id}
        },{
          $push: {guilders: {_id: gw.user._id}}
        }).then(function(query){
          if(query.result.nModified != 1){
            // gw.statusCode = 406;
            // gw.json({error:gw.i18n('pillars.statusCodes',{code:gw.statusCode})});
            gw.error(406);
          } else {
            //gw.json({result:1});
            gw.redirect("/guilds");
          }
        }).catch(function(error){
          // gw.statusCode = 500;
          // gw.json({error:error});
          gw.error(500, error);
        });
      } else {
        gw.error(400);
      }
      */
    })
  ]
}));

// Guilds view
project.routes.add(new Route({
  path: "/guilds",
  session: true,  // active sessions
  passport: true, // force automatic PassportGithub login
}, function(gw){
  /*
  Promise.all([
    project.DB.collection("users").find({}).project({}).toArray(),
    project.DB.collection("guilds").find({}).project({}).toArray()
  ]).then(function(results){
    */
    const users = [
    {
    "_id" : ObjectId("5aada83b8b1de5a37427d255"),
    "githubId" : "2388058",
    "githubProfile" : {
        "id" : "2388058",
        "displayName" : "Javier Gallego Martín",
        "username" : "bifuer",
        "profileUrl" : "https://github.com/bifuer",
        "emails" : [ 
            {
                "value" : "bifuer@gmail.com"
            }
        ],
        "photos" : [ 
            {
                "value" : "https://avatars2.githubusercontent.com/u/2388058?v=4"
            }
        ],
        "provider" : "github",
        "_raw" : "{\"login\":\"bifuer\",\"id\":2388058,\"avatar_url\":\"https://avatars2.githubusercontent.com/u/2388058?v=4\",\"gravatar_id\":\"\",\"url\":\"https://api.github.com/users/bifuer\",\"html_url\":\"https://github.com/bifuer\",\"followers_url\":\"https://api.github.com/users/bifuer/followers\",\"following_url\":\"https://api.github.com/users/bifuer/following{/other_user}\",\"gists_url\":\"https://api.github.com/users/bifuer/gists{/gist_id}\",\"starred_url\":\"https://api.github.com/users/bifuer/starred{/owner}{/repo}\",\"subscriptions_url\":\"https://api.github.com/users/bifuer/subscriptions\",\"organizations_url\":\"https://api.github.com/users/bifuer/orgs\",\"repos_url\":\"https://api.github.com/users/bifuer/repos\",\"events_url\":\"https://api.github.com/users/bifuer/events{/privacy}\",\"received_events_url\":\"https://api.github.com/users/bifuer/received_events\",\"type\":\"User\",\"site_admin\":false,\"name\":\"Javier Gallego Martín\",\"company\":null,\"blog\":\"\",\"location\":\"Andalucía, Spain\",\"email\":\"bifuer@gmail.com\",\"hireable\":true,\"bio\":null,\"public_repos\":1,\"public_gists\":0,\"followers\":15,\"following\":14,\"created_at\":\"2012-09-20T18:39:35Z\",\"updated_at\":\"2018-03-11T17:29:39Z\"}",
        "_json" : {
            "login" : "bifuer",
            "id" : 2388058,
            "avatar_url" : "https://avatars2.githubusercontent.com/u/2388058?v=4",
            "gravatar_id" : "",
            "url" : "https://api.github.com/users/bifuer",
            "html_url" : "https://github.com/bifuer",
            "followers_url" : "https://api.github.com/users/bifuer/followers",
            "following_url" : "https://api.github.com/users/bifuer/following{/other_user}",
            "gists_url" : "https://api.github.com/users/bifuer/gists{/gist_id}",
            "starred_url" : "https://api.github.com/users/bifuer/starred{/owner}{/repo}",
            "subscriptions_url" : "https://api.github.com/users/bifuer/subscriptions",
            "organizations_url" : "https://api.github.com/users/bifuer/orgs",
            "repos_url" : "https://api.github.com/users/bifuer/repos",
            "events_url" : "https://api.github.com/users/bifuer/events{/privacy}",
            "received_events_url" : "https://api.github.com/users/bifuer/received_events",
            "type" : "User",
            "site_admin" : false,
            "name" : "Javier Gallego Martín",
            "company" : null,
            "blog" : "",
            "location" : "Andalucía, Spain",
            "email" : "bifuer@gmail.com",
            "hireable" : true,
            "bio" : null,
            "public_repos" : 1,
            "public_gists" : 0,
            "followers" : 15,
            "following" : 14,
            "created_at" : "2012-09-20T18:39:35Z",
            "updated_at" : "2018-03-11T17:29:39Z"
        }
    },
    "githubRefreshToken" : null,
    "githubToken" : "3c27486524347d29519e8c532b7ca8b612f8653f",
    "logins" : [ 
        1521330235335.0, 
        1521330525048.0, 
        1521330966158.0
    ]
}];
    const guilds = [
    {
    "_id" : ObjectId("5aadace48b1de5a37427d3c1"),
    "flag" : false,
    "name" : "Metaguild",
    "motto" : "Descripción de la guild...",
    "readme" : "https://...",
    "guilders" : [{
      _id: ObjectId("5aada83b8b1de5a37427d255")
    }],
    "projects" : [ 
        {
            "name" : "Guilds web",
            "motto" : "La web de OSW donde puedes liearte tu mism@ ;)",
            "stack" : [ 
                "nodejs", 
                "javascript", 
                "pillars", 
                "passport"
            ],
            "wanted" : [ 
                "Se busca... Lo he olvidado...", 
                "En busca y captura: frontend vuenisim@, recompensa aquí"
            ],
            "status" : 0,
            "repo" : "https://..."
        }
    ]
    }
    ];
    gw.render("./templates/home.pug", {
      users : function(_id){
        return users.find(function(user){
          return user._id.toString() === _id.toString();
        });
      },
      inGuilders : function(guilders = []){
        return guilders.find(function(guilder){
          return false;
          //return guilder._id.toString() === gw.user._id.toString();
        });
      },
      guilds
    });
  /*
  }).catch(function(error){
    gw.error(500, error);
  });
  */
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

function ObjectId(s){
  return s;
}