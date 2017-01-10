const Authentication = require('./controllers/authentication');
const User = require('./controllers/user');
const passportService = require('./services/passport');
const passport = require('passport');

const requireAuth = passport.authenticate('jwt', {session: false});
const requireLogin = passport.authenticate('local', {session: false});

const requireFBCallBack = passport.authenticate('facebook-token');

module.exports = function(app) {

    app.use(passport.initialize());
    app.use(passport.session());

    //Authentication routes
    app.post('/api/users/signup', Authentication.signup);
    app.post('/api/users/login', requireLogin, Authentication.login);
    app.post('/api/auth/facebook/token', requireFBCallBack, Authentication.fbLogin);

    app.patch('/api/users/:id', requireAuth, User.updateUser);

}
