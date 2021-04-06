const express = require('express');
const passport = require('passport');
const verifyroute = express.Router();

function router() {
  verifyroute.route('/')
    .get(passport.authenticate('google',
      {
        scope: ['https://www.googleapis.com/auth/plus.login', 'https://www.googleapis.com/auth/contacts', 'email'],
        accessType: 'offline',
        prompt: 'consent',
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
