const express = require('express');
const { google } = require('googleapis');
const { ensureAuth } = require('../auth');
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
      const basic = [];
      let tno = 0;
      const profileinfo = {
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
            console.error(`error: ${err}`);
            reject();
          }
          tno = `(${resp.data.totalPeople})`;
          const { connections } = resp.data;
          if (connections) {
            let i = 0;
            connections.forEach((person) => {
              if (person.names) {
                let phone = ' ';
                let email = ' ';
                if (person.phoneNumbers) {
                  phone = person.phoneNumbers[0].value;
                }
                if (person.emailAddresses) {
                  email = person.emailAddresses[0].value;
                }
                basic[i++] = {
                  name: person.names[0].displayName,
                  phone: phone,
                  email: email,
                  photo: person.photos[0].url,
                };
              }
            });
            resolve();
          } else {
            console.log('No connections');
            basic[0] = {
              name: 'No Contacts',
              phone: '-',
              photo: 'null.img',
            };
            resolve();
          }
        });
      });
      promise2
        .catch(() => res.render('contacts', { basic, profileinfo, tno }))
        .then(() => res.render('contacts', { basic, profileinfo, tno }));
    });

  
  return contactsroute;
}

module.exports = router;
