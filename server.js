const express = require('express'),
    helmet = require('helmet'),
    config = require('./config'),
    logger = require('./logger');

const app = express();

app.use(helmet());

app.get('/', (req, res) => {
  res.send('Hello Guilders!');
});

app.listen(config.port, () => {
  logger.info(`[INFO] Server listening on port ${config.port}!`);
});
