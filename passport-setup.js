const passport = require('passport');
const googleAuthenticate = require('passport-google-oauth2').Strategy;
passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((user, done) => {
  done(null, user);
});
passport.use(new googleAuthenticate(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.callbackAuth,
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
    return done(null, user);
  },
));
