const _ = require('lodash');
const {User} = require('../models/user');

exports.signup = (req, res, next) => {

    const body = _.pick(req.body, [
        'email',
        'password'
    ]);

    if(!body.email) {
        return res.status(400).send("Email is required");
    }

    if(!body.password) {
        return res.status(400).send("Password is required");
    }

    const user = new User(body);

    //User does NOT exist, save it to DB
    user.save().then(() => {
        return user.generateAuthToken();
    }).then((token) => {
        res.header('x-auth', token).send(user);
    }).catch((e) => {
        // if(e.code === 11000) {
        //     res.status(422).send("Email already in use!");
        // }
        res.status(400);
    })
}

exports.login = (req, res, next) => {
    req.user.generateAuthToken().then((token) => {
        res.header('x-auth', token).send(req.user);
    }).catch((e) => {
        res.status(401).send();
    });
}

exports.fbLogin = (req, res) => {
    req.user.generateAuthToken().then((token) => {
        res.header('x-auth', token).send(req.user);
    }).catch((e) => {
        res.status(401).send();
    })
}

exports.googleLogin = (req, res) => {
    req.user.generateAuthToken().then((token) => {
        res.header('x-auth', token).send(req.user);
    }).catch((e) => {
        res.status(401).send();
    })
}
