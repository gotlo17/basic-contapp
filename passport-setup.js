const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth2').Strategy;

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

passport.use(new GoogleStrategy(
  {
    clientID: '691744154791-sqq6djn27k6vou8jqmb19bjr6p9pp4b3.apps.googleusercontent.com',
    clientSecret: '_VQeqxq1DB0LUaY-dQNIanl1',
    callbackURL: 'https://cont-node-deploy.herokuapp.com/auth/callback/',
  },
  (accessToken, refreshToken, otherTokenDetails, profile, done) => {
    const tokens = {
      access_token: accessToken,
      refresh_token: refreshToken,
      scope: otherTokenDetails.scope,
      token_type: otherTokenDetails.token_type,
      expiry_date: otherTokenDetails.expires_in,
    };
    const data = JSON.stringify(tokens);
    const user = {
      token: data,
      profile,
    };
    console.log('AAAASSSSAAAAAAASSSSSS-------------AAAAAA', user);
    return done(null, user);
  },
));
