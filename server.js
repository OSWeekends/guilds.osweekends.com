const express = require('express'),
    config = require('./config'),
    logger = require('./logger');

const app = express();

app.get('/', (req, res) => {
  res.send('Hello Guilders!');
});

app.listen(config.port, () => {
  logger.info(`[INFO] Server listening on port ${config.port}!`);
});
