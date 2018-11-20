const config = {
  port: process.env.PORT || 3000,
  session: {
    secret: process.env.SESSION_SECRET || '!',
    resave: false,
    saveUninitialized: false
  },
  github: {
    clientID: process.env.GITHUB_CLIENT_ID || '',
    clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
    callback: process.env.GITHUB_CALLBACK || ''
  }
};

module.exports = config;
