const express = require('express');
const chalk = require('chalk');
const debug = require('debug')('app');
const morgan = require('morgan');
const path = require('path');
const { google } = require('googleapis');
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
app.use(express.static(path.join(__dirname,'/public')));
app.set('views', './src/views');
app.set('view engine', 'ejs');

const verifyroute = require('./src/routes/verifyroute.js')(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET);

app.use('/auth', verifyroute);

app.get('/', (req, res) => {
  res.render('contacts');
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
