const _ = require('lodash');
const {ObjectID} = require('mongodb');
const {User} = require('../models/user');

exports.updateUser = (req, res, next) => {
    const id = req.params.id;

    const body = _.pick(req.body, ['username']);

    if(!ObjectID.isValid(id)) {
        return res.status(404).send();
    }

    if(_.isString(body.username) && body.username) {
        User.findByIdAndUpdate(id, {$set: body}, {new: true})
            .then((user) => {
                res.send(user);
            })
            .catch((e) => {
                res.status(400).send();
            })
    } else {
        return res.status(400).send();
    }
}

exports.getUserProfile = (req, res, next) => {
    const id = req.params.id;

    if(!ObjectID.isValid(id)) {
        return res.status(404).send();
    }

    User.findById(id)
        .then((user) => {
            res.send(user);
        })
        .catch((e) => {
            res.status(400).send();
        });
}
