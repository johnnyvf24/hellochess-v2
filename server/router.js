const Authentication = require('./controllers/authentication');
const User = require('./controllers/user');
const passportService = require('./services/passport');
const passport = require('passport');

const requireAuth = passport.authenticate('jwt', {session: false});
const requireLogin = passport.authenticate('local', {session: false});

const requireFB = passport.authenticate('facebook-token');
const requireGoogle = passport.authenticate('google-plus-token');

module.exports = function(app) {

    app.use(passport.initialize());
    app.use(passport.session());

    //Authentication routes
    app.post('/api/users/signup', Authentication.signup);
    app.post('/api/users/login', requireLogin, Authentication.login);
    app.post('/api/auth/facebook/token', requireFB, Authentication.fbLogin);
    app.get('/api/auth/google/token', requireGoogle, Authentication.googleLogin)

    app.patch('/api/users/:id', requireAuth, User.updateUser);

}
