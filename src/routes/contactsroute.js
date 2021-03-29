const express = require('express');
const { google } = require('googleapis');
const { ensureAuth, ensureGuest } = require('../middleware/auth');

const contactsroute = express.Router();

function router(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET) {
  contactsroute.route('/')
    .get(ensureAuth, (req, res) => {
      console.log(req.user);
      const oath2 = new google.auth.OAuth2(
        GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET,
        'http://localhost:3000/contacts/',
      );
      const tokens = JSON.parse(req.user.token);
      oath2.setCredentials(tokens);
      const pingo = [];
      const profinfo = {
        name: req.user.profile.displayName,
        email: req.user.profile.emails[0].value,
        photo: req.user.profile.photos[0].value,
      };
      const service = google.people({ version: 'v1', auth: oath2 });
      const promise2 = new Promise((resolve, reject) => {
        service.people.connections.list({
          resourceName: 'people/me',
          pageSize: 500,
          personFields: 'names,phoneNumbers,photos',
        }, (err, resp) => {
          if (err) {
            console.error(`The API returned an error: ${err}`);
            reject();
          }
          const { connections } = resp.data;
          if (connections) {
            let i = 0;
            connections.forEach((person) => {
              if (person.names && person.names.length > 0 && person.phoneNumbers) {
                pingo[i++] = {
                  name: person.names[0].displayName,
                  phone: person.phoneNumbers[0].canonicalForm,
                  photo: person.photos[0].url,
                };
              }
            });
            resolve();
          } else {
            console.log('No connections found.');
            pingo[0] = {
              name: 'No Contacts found',
              phone: '-',
              photo: 'null.img',
            };
            resolve();
          }
        });
      });
      promise2
        .catch(() => res.render('contacts copy', { pingo, profinfo }))
        .then(() => res.render('contacts copy', { pingo, profinfo }));
    });
  contactsroute.route('/search')
    .post(ensureAuth, async (req, res) => {
      const pingo = [];
      const oath2 = new google.auth.OAuth2(
        GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET,
        'http://localhost:3000/contacts/',
      );
      const profinfo = {
        name: req.user.profile.displayName,
        email: req.user.profile.emails[0].value,
        photo: req.user.profile.photos[0].value,
      };
      const tokens = JSON.parse(req.user.token);
      oath2.setCredentials(tokens);
      const service = google.people({ version: 'v1', auth: oath2 });
      const promise2 = new Promise((resolve, reject) => {
        service.people.searchContacts({
          query: req.body.sname,
          pageSize: 10,
          readMask: 'names,phoneNumbers,photos',
          // eslint-disable-next-line consistent-return
        }, (err, resp) => {
          if (err) return console.error(`The API returned an error: ${err}`);
          const { results } = resp.data;
          if (results) {
            let i = 0;
            results.forEach((person) => {
              if (person.person.names && person.person.phoneNumbers) {
                pingo[i++] = {
                  name: person.person.names[0].displayName,
                  phone: person.person.phoneNumbers[0].canonicalForm,
                  photo: person.person.photos[0].url,
                };
              }
            });
            resolve();
          } else {
            console.log('No connections found.');
            pingo[0] = {
              name: 'No Results found',
              phone: '-',
              photo: 'null.img',
            };
            reject();
          }
        });
      });
      promise2
        .catch(() => res.render('contacts copy', { pingo, profinfo }))
        .then(() => res.render('contacts copy', { pingo, profinfo }));
    });
  return contactsroute;
}

module.exports = router;
