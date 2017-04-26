const _ = require('lodash');
const {StandardGame} = require('../models/standard');
const {User} = require('../models/user');
const {ObjectID} = require('mongodb');

exports.getRecentGames = (req, res, next) => {
    const id = req.params.id;

    if(!ObjectID.isValid(id)) {
        return res.status(404).send();
    }
    
    //get last 10 standard games
    StandardGame.find({ $or : [ { "white.user_id": ObjectID(id)}, { "black.user_id": ObjectID(id) } ] } )
        .populate('black.user_id')
        .populate('white.user_id')
        .limit(10)
        .then((games) => {
            res.send(games);
        })
        .catch((e) => {
            res.status(400).send();
        });
}

