const express = require('express');
const { google } = require('googleapis');
const axios = require('axios');
const urlParse = require('url-parse');
const queryParse = require('query-string');
const bodyParser = require('body-parser');

const verifyroute = express.Router();

verifyroute.use(bodyParser.urlencoded({ extended: false }));

let profinfo = 1;
let pingo = [];
let sear = [];
let oath2 = false;

function router(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET) {
  verifyroute.route('/')
    .get((req, res) => {
      const oaths2 = new google.auth.OAuth2(
        GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET,
        'http://localhost:3000/auth/contacts/',
      );

      const SCOPES = ['https://www.googleapis.com/auth/contacts', 'profile', 'email'];

      const url = oaths2.generateAuthUrl({
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
      if (oath2 === false) {
        const queryURL = new urlParse(req.url);
        const { code } = queryParse.parse(queryURL.query);

        oath2 = new google.auth.OAuth2(
          GOOGLE_CLIENT_ID,
          GOOGLE_CLIENT_SECRET,
          'http://localhost:3000/auth/contacts/',
        );
        const { tokens } = await oath2.getToken(code);
        oath2.setCredentials(tokens);
      }
      // listConnectionNames(oath2);
      const service = google.people({ version: 'v1', auth: oath2 });
      const promise1 = new Promise((resolve, reject) => {
        service.people.get({
          resourceName: 'people/me',
          personFields: 'names,emailAddresses,photos',
        }, (err, res) => {
          if (err) {
            console.error(`The API returned an error: ${err}`);
            reject();
          }
          const per = res.data;
          profinfo = {
            name: per.names[0].displayName,
            email: per.emailAddresses[0].value,
            photo: per.photos[0].url,
          };
          console.log(profinfo.name, profinfo.email);
          resolve();
        });
      });

      const promise2 = new Promise((resolve, reject) => {
        service.people.connections.list({
          resourceName: 'people/me',
          pageSize: 500,
          personFields: 'names,phoneNumbers,photos',
        }, (err, res) => {
          if (err) return console.error(`The API returned an error: ${err}`);
          const { connections } = res.data;
          if (connections) {
            let i = 0;
            connections.forEach((person) => {
              if (person.names && person.names.length > 0 && person.phoneNumbers) {
                sear[i++] = {
                  name: person.names[0].displayName,
                  phone: person.phoneNumbers[0].canonicalForm,
                  photo: person.photos[0].url,
                };
              }
            });
            resolve();
          } else {
            console.log('No connections found.');
            reject();
          }
        });
      });

      Promise.all([promise1, promise2]).then(() => {
        res.redirect('/auth/view');
      });
    });
  verifyroute.route('/view')
    .get((req, res) => {
      pingo = sear;
      res.render('contacts copy', { pingo, profinfo });
    });
  verifyroute.route('/search')
    .post(async (req, res) => {
      console.log('hello', req.body.sname);
      const service = google.people({ version: 'v1', auth: oath2 });
      const promise2 = new Promise((resolve, reject) => {
        service.people.searchContacts({
          query: req.body.sname,
          pageSize: 10,
          readMask: 'names,phoneNumbers,photos',
        }, (err, res) => {
          if (err) return console.error(`The API returned an error: ${err}`);
          const { results } = res.data;
          if (results) {
            let i = 0;
            pingo = [];
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
            reject();
          }
        });
      });
      promise2.then(() => res.render('contacts copy', { pingo, profinfo }));
    });
  verifyroute.route('/logout')
    .get((req, res) => {
      oath2 = false;
      pingo = [];
      sear = [];
      profinfo = 1;
      res.redirect('/');
    });


  return verifyroute;
}

module.exports = router;
