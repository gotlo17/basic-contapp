const express = require('express');
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

const GOOGLE_CLIENT_ID = '691744154791-sqq6djn27k6vou8jqmb19bjr6p9pp4b3.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = '_VQeqxq1DB0LUaY-dQNIanl1';

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
const contacts = require('./src/routes/contactsroute.js')(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET);

app.use('/auth', verifyroute);
app.use('/contacts', contacts);

app.get('/', ensureGuest, (req, res) => {
  res.render('index');
});

app.listen(port, () => {
  debug(`Server listening on port  ${chalk.green(port)}`);
});
