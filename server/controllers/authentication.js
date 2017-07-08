const _ = require('lodash');
const {User} = require('../models/user');
const {ObjectID} = require('mongodb');

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
        if(e.code === 11000) {
            res.status(422).send("Email already in use!");
        }
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

exports.anonLogin = (req, res, next) => {
    let defaultRatings = {
        classic: 1200, rapid: 1200, blitz: 1200, bullet: 1200
    }
    let newID = ObjectID();
    let anonProfile = {
        _id: newID,
        picture: "/img/default-img.png",
        email: "",
        username: "Anonymous",
        social: false,
        anonymous: true,
        standard_ratings: {...defaultRatings},
        schess_ratings: {...defaultRatings},
        fourplayer_ratings: {...defaultRatings},
        crazyhouse_ratings: {...defaultRatings},
        crazyhouse960_ratings: {...defaultRatings},
        fullhouse_ratings: {...defaultRatings}
    };
    res.send(anonProfile);
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
