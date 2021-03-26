const express = require('express');
const { google } = require('googleapis');
const axios = require('axios');
const urlParse = require('url-parse');
const queryParse = require('query-string');

const verifyroute = express.Router();

function listConnectionNames(oath) {
  const service = google.people({version: 'v1', auth:oath });
  service.people.connections.list({
    resourceName: 'people/me',
    pageSize: 3,
    personFields: 'names,phoneNumbers',
  }, (err, res) => {
    if (err) return console.error(`The API returned an error: ${err}`);
    const { connections } = res.data;
    if (connections) {
      connections.forEach((person) => {
        if (person.names && person.names.length > 0) {
          console.log(person.names[0].displayName);
        }
      });
    } else {
      console.log('No connections found.');
    }
  });
  service.people.get({
    resourceName: 'people/me',
    personFields: 'names,emailAddresses',
  }, (err, res) => {
    if (err) return console.error(`The API returned an error: ${err}`);
    const per = res.data;
    const profinfo = { name: per.names[0].displayName, email:per.emailAddresses[0].value};
    console.log(profinfo.name,profinfo.email);
  });
};

function router(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET) {
  verifyroute.route('/')
    .get((req, res) => {
      const oath2 = new google.auth.OAuth2(
        GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET,
        'http://localhost:3000/auth/contacts',
      );

      const SCOPES = ['https://www.googleapis.com/auth/contacts', 'profile'];

      const url = oath2.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
        state: JSON.stringify({
          callbackUrl: req.body.callbackUrl,
          userID: req.body.userID,
        }),
      });
      axios.get(url)
        .then(() => {
          res.redirect(url);
        })
        .catch((error) => {
          console.log(error);
        });
    });
  verifyroute.route('/contacts')
    .get(async (req, res) => {
      const queryURL = new urlParse(req.url);
      const { code } = queryParse.parse(queryURL.query);

      const oath2 = new google.auth.OAuth2(
        GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET,
        'http://localhost:3000/auth/contacts',
      );

      const { tokens } = await oath2.getToken(code);
      oath2.setCredentials(tokens);
      res.render('contacts');
      listConnectionNames(oath2);
    });

  return verifyroute;
}

module.exports = router;