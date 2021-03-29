const express = require('express');
require('dotenv').config();
const chalk = require('chalk');
const debug = require('debug')('app');
const morgan = require('morgan');
const path = require('path');
const cors = require('cors');
const passport = require('passport');
const cookieSession = require('cookie-session');
require('./passport-setup');


const bodyParser = require('body-parser');
const { ensureGuest } = require('./src/middleware/auth');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cookieSession({
  name: 'Cont-session',
  keys: ['key1, key2'],
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(morgan('tiny'));
app.use(express.static(path.join(__dirname, '/public')));
app.set('views', './src/views');
app.set('view engine', 'ejs');

const verifyroute = require('./src/routes/verifyroute.js')();
const contacts = require('./src/routes/contactsroute.js')();

app.use('/auth', verifyroute);
app.use('/contacts', contacts);

app.get('/', ensureGuest, (req, res) => {
  res.render('index');
});

app.listen(port, () => {
  debug(`Server listening on port  ${chalk.green(port)}`);
});
