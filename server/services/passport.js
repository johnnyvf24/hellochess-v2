const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const FacebookTokenStrategy = require('passport-facebook-token');
const GooglePlusTokenStrategy = require('passport-google-plus-token');
const {User} = require('../models/user');
const config  = require('../../config/config');
const LocalStrategy = require('passport-local');

const localOptions = {
    usernameField: 'email'
}

//Login strategy, verifies auth token.
const localLogin = new LocalStrategy(localOptions, (email, password, done) => {
    User.findOne({email}).select('+password')
    .then((user) => {
        if(!user) {
            done(null, false);
        }

        user.comparePassword(password, (err, isMatch) => {
            if(err) {
                return done(err);
            }
            if(!isMatch) {
                return done(null, false);
            }

            return done(null, user);
        });

    }).catch((e) => {
        done(e);
    });
});

//options for JWT strategy
const jwtOptions= {
    jwtFromRequest: ExtractJwt.fromHeader('x-auth'),
    secretOrKey: config.secret
};

const jwtLogin = new JwtStrategy(jwtOptions, function(payload, done) {

    User.findById(payload.sub, function(err, user) {
        if(err) {
            return done(err, false);
        }

        if(user) {
            done(null, user);
        } else {
            done(null, false);
        }
    });
});

const { clientID, clientSecret, callbackURL, profileFields } = config.facebookAuth;

const FBLogin = new FacebookTokenStrategy({ clientID, clientSecret, profileFields },
    function(accessToken, refreshToken, profile, done) {
        User.findOne({'socialProvider.id': profile.id}, (err, user) => {
            if(err) {
                return done()
            }
            if(user) {
                return done(null, user);
            }
            else {
                let newUser = new User();

                newUser.socialProvider.name = 'facebook',
                newUser.socialProvider.id = profile.id;
                newUser.social = true;
                newUser.name = profile.name.givenName + ' ' + profile.name.familyName;
                newUser.email = profile.emails[0].value;
                newUser.picture = profile._json.picture.data.url;
                newUser.social.token = accessToken;

                newUser.save((err) => {
                    if(err) {
                        console.log(err)
                    }
                    return done(null, newUser);
                });
            }
        })
    }
);

const { GoogleClientID, GoogleClientSecret } = config.googleAuth;

const GoogleLogin = new GooglePlusTokenStrategy({
    clientID: GoogleClientID,
    clientSecret: GoogleClientSecret,
    passReqToCallback: true },
    function(req, accessToken, refreshToken, profile, done) {
        User.findOne({'socialProvider.id': profile.id}, (err, user) => {
            if(err) {
                return done()
            }
            if(user) {
                return done(null, user);
            }
            else {
                let newUser = new User();

                newUser.socialProvider.name = profile.provider
                newUser.socialProvider.id = profile.id;
                newUser.social = true;
                newUser.name = profile.name.givenName + ' ' + profile.name.familyName ;
                newUser.email = profile.emails[0].value;
                newUser.picture = profile._json.image.url;
                newUser.social.token = accessToken;

                newUser.save((err) => {
                    if(err) {
                        console.log(err)
                    }
                    return done(null, newUser);
                });
            }
        })
    }
);

passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});

//tell passport to use Strategies
passport.use(jwtLogin);
passport.use(localLogin);
passport.use(FBLogin);
passport.use(GoogleLogin);
