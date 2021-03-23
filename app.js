const express = require('express');
const chalk = require('chalk');
const debug = require('debug')('app');
const morgan = require('morgan');
const path = require('path');

const app = express();
const port = process.env.PORT || 4000;

app.use(morgan('tiny'));
app.set('views', './src/views');
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render('index');
});
app.listen(port, () => {
  debug(`Server listening on port  ${chalk.green(port)}`);
});
