const express = require('express');
const chalk = require('chalk');
const debug = require('debug')('app');
const morgan = require('morgan');
const path = require('path');
const { google } = require('googleapis');
const request = require('request');
const cors = require('cors');
const urlParse = require('url-parse');
const queryParse = require('query-string');
const bodyParser = require('body-parser');
const axios = require('axios');

const GOOGLE_CLIENT_ID = '691744154791-sqq6djn27k6vou8jqmb19bjr6p9pp4b3.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = '_VQeqxq1DB0LUaY-dQNIanl1';

const app = express();
const port = process.env.PORT || 3000;


app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(morgan('tiny'));
app.use(express.static(__dirname + '/public'));
app.set('views', './src/views');
app.set('view engine', 'ejs');

function listConnectionNames(oath) {
  const service = google.people({version: 'v1', auth:oath });
  service.people.connections.list({
    resourceName: 'people/me',
    pageSize: 2,
    personFields: 'names,phoneNumbers',
  }, (err, res) => {
    if (err) return console.error(`The API returned an error: ${  err}`);
    const { connections } = res.data;
    if (connections) {
      console.log('Connections:');
      connections.forEach((person) => {
        if (person.names && person.names.length > 0) {
          console.log(person.names[0].displayName);
        } else {
          console.log('No display name found for connection.');
        }
      });
    } else {
      console.log('No connections found.');
    }
  });
}


app.get('/', (req, res) => {
  res.render('index');
});
app.get('/u', (req, res) => {
  const oath2 = new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    'http://localhost:3000/auth',
  );

  const SCOPES = ['https://www.googleapis.com/auth/contacts'];

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

app.get('/auth', async (req, res) => {
  const queryURL = new urlParse(req.url);
  const { code } = queryParse.parse(queryURL.query);

  
  const oath2 = new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    'http://localhost:3000/auth',
  );

  const { tokens } = await oath2.getToken(code);
  oath2.setCredentials(tokens);
  res.send('HEEEEEELLLLLLLLLLLLLLOOOOOOOOOOOOOOOOOOO!!!!!!!!!!!!!');
  listConnectionNames(oath2);
});

app.listen(port, () => {
  debug(`Server listening on port  ${chalk.green(port)}`);
});




  // service.people.createContact({
  //   requestBody: {
  //     emailAddresses: [{value: 'test@test.com'}],
  //     names: [
  //       {
  //         displayName: 'A',
  //         familyName: 'B',
  //         givenName: 'C',
  //       },
  //     ],
  //   },
  // });
  // //console.log('\n\nCreated Contact:', newContact);
