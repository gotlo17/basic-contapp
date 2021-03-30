const express = require('express');
const { google } = require('googleapis');
const { ensureAuth, ensureGuest } = require('../middleware/auth');

const contactsroute = express.Router();

function router() {
  contactsroute.route('/')
    .get(ensureAuth, (req, res) => {
      const oath2 = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.callbackCont,
      );
      const tokens = JSON.parse(req.user.token);
      oath2.setCredentials(tokens);
      const pingo = [];
      let tno = 0;
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
          personFields: 'names,phoneNumbers,photos,emailAddresses',
        }, (err, resp) => {
          if (err) {
            console.error(`The API returned an error: ${err}`);
            reject();
          }
          tno = `(${resp.data.totalPeople})`;
          const { connections } = resp.data;
          if (connections) {
            let i = 0;
            connections.forEach((person) => {
              if (person.names) {
                let ph = ' ';
                let em = ' ';
                if (person.phoneNumbers) {
                  ph = person.phoneNumbers[0].value;
                }
                if (person.emailAddresses) {
                  em = person.emailAddresses[0].value;
                }
                pingo[i++] = {
                  name: person.names[0].displayName,
                  phone: ph,
                  email: em,
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
        .catch(() => res.render('contacts copy', { pingo, profinfo, tno }))
        .then(() => res.render('contacts copy', { pingo, profinfo, tno }));
    });

  contactsroute.route('/search')
    .post(ensureAuth, async (req, res) => {
      const pingo = [];
      let tno = 0;
      const oath2 = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.callbackCont,
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
          readMask: 'names,phoneNumbers,photos,emailAddresses',
          // eslint-disable-next-line consistent-return
        }, (err, resp) => {
          if (err) return console.error(`The API returned an error: ${err}`);
          tno = `: Search Results`;
          const { results } = resp.data;
          if (results) {
            let i = 0;
            results.forEach((person) => {
              if (person.person.names) {
                let ph = ' ';
                let em = ' ';
                if (person.person.phoneNumbers) {
                  ph = person.person.phoneNumbers[0].value;
                }
                if (person.person.emailAddresses) {
                  em = person.person.emailAddresses[0].value;
                }
                pingo[i++] = {
                  name: person.person.names[0].displayName,
                  phone: ph,
                  email: em,
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
        .catch(() => res.render('contacts copy', { pingo, profinfo, tno }))
        .then(() => res.render('contacts copy', { pingo, profinfo, tno }));
    });
  return contactsroute;
}

module.exports = router;
