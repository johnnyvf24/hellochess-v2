const _ = require('lodash');
const {User} = require('../models/user');

exports.signup = (req, res, next) => {

    const body = _.pick(req.body, [
        'username',
        'email',
        'password'
    ]);

    const user = new User(body);

    //User does NOT exist, save it to DB
    user.save().then(() => {
        return user.generateAuthToken();
    }).then((token) => {
        res.header('x-auth', token).send(user);
    }).catch((e) => {
        res.status(400).send(e);
    })
}

exports.login = (req, res, next) => {
    req.user.generateAuthToken().then((token) => {
        res.header('x-auth', token).send(req.user);
    }).catch((e) => {
        res.status(400).send();
    })

}
