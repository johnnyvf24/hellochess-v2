const Authentication = require('./controllers/authentication');
const User = require('./controllers/user');
const passportService = require('./services/passport');
const passport = require('passport');

const requireAuth = passport.authenticate('jwt', {session: false});
const requireLogin = passport.authenticate('local', {session: false});

module.exports = function(app) {
    app.get('/api', requireAuth, (req, res) => {
        res.send({message: 'Super secret code is ABC123!'});
    })
    app.post('/api/users', Authentication.signup);
    app.post('/api/users/login', requireLogin, Authentication.login);
    app.patch('/api/users/:id', requireAuth, User.updateUser)
}
