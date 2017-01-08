const passport = require('passport');
const {User} = require('../models/user');
const config  = require('../config');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const LocalStrategy = require('passport-local');

const localOptions = {
    usernameField: 'email'
}

const localLogin = new LocalStrategy(localOptions, (email, password, done) => {
    User.findOne({email})
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
    })
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

//tell passport to use Strategies
passport.use(jwtLogin);
passport.use(localLogin);
