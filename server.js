const express = require('express'),
    helmet = require('helmet'),
    config = require('./config'),
    logger = require('./logger');

const app = express();

// Middelware
app.use(helmet());
app.use((req, res, next) => {
    logger.info(`[${new Date().getTime()}] | IP: ${req.connection.remoteAddress} | UserAgent: ${req.headers['user-agent']}`);
    next();
});

app.set('view engine', 'pug');

// Routes
app.get('/', (req, res) => {
  res.render('index', { title: 'Welcome to Guilds.osweekends.com', message: '👋 Guilder!'});
});

// Port
app.listen(config.port, () => {
  logger.info(`[INFO] Server listening on port ${config.port}!`);
});
