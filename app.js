const express = require('express');
require('dotenv').config();
const path = require('path');
const passport = require('passport');
const cookieSession = require('cookie-session');
require('./passport-setup');
const authenticate = require('./src/routes/authenticate.js')();
const contacts = require('./src/routes/contacts.js')();

const app = express();
const port = process.env.PORT || 3000;
app.use(cookieSession({
  name: 'Cont-session',
  keys: ['key1, key2'],
}));
app.use(express.static(path.join(__dirname, '/public')));
app.set('views', './src/views');
app.set('view engine', 'ejs');
app.use(passport.initialize());
app.use(passport.session());
app.use('/auth', authenticate);
app.use('/contacts', contacts);



app.listen(port, () => {
  console.log(`Server listening on port  ${port}`);
});
