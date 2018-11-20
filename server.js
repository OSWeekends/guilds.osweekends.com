const express = require('express');
const config = require('./config');

const app = express();

app.get('/', (req, res) => {
  res.send('Hello Guilders!');
});

app.listen(config.port, () => {
  console.log(`Server listening on port ${config.port}!`);
});
