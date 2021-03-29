const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const { ensureAuth, ensureGuest } = require('../middleware/auth');

const verifyroute = express.Router();

verifyroute.use(bodyParser.urlencoded({ extended: false }));

function router() {
  verifyroute.route('/')
    .get(passport.authenticate('google',
      {
        scope: ['https://www.googleapis.com/auth/plus.login', 'https://www.googleapis.com/auth/contacts', 'email'],
        accessType: 'offline',
      }));

  verifyroute.route('/callback')
    .get(passport.authenticate('google', {
      successRedirect: '/contacts',
      failureRedirect: '/',
    }));

  verifyroute.route('/logout')
    .get((req, res) => {
      req.session = null;
      req.logout();
      res.redirect('/');
    });

  return verifyroute;
}

module.exports = router;
