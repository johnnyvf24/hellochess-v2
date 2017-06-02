const _ = require('lodash');
const {StandardGame} = require('../models/standard');
import {SChessDB} from '../models/schess';
const {CrazyhouseGame} = require('../models/crazyhouse');
const {Crazyhouse960Game} = require('../models/crazyhouse960');
const {FourGameDB} = require('../models/fourgame');
const {User} = require('../models/user');
const {ObjectID} = require('mongodb');
const Async = require('async');

exports.getRecentGames = (req, res, next) => {
    const id = req.params.id;

    if(!ObjectID.isValid(id)) {
        return res.status(404).send();
    }
    
    let recentGames = {
        standard: function(cb) {
            //get last 5 standard games
            StandardGame.find({ $or : [ { "white.user_id": ObjectID(id)}, { "black.user_id": ObjectID(id) } ] } )
                .populate('black.user_id')
                .populate('white.user_id')
                .sort({$natural: -1})
                .limit(5)
                .then((games) => {
                    cb(null, games);
                })
                .catch((e) => {
                    cb(e);
                });
        },
        four_player: function(cb) {
            //get last 5 schess games
            FourGameDB.find({ $or : [
                                    { "white.user_id": ObjectID(id) }, 
                                    { "black.user_id": ObjectID(id) },
                                    { "gold.user_id": ObjectID(id) },
                                    { "red.user_id": ObjectID(id) },
                                    ]})
                .populate('black.user_id')
                .populate('white.user_id')
                .populate('gold.user_id')
                .populate('red.user_id')
                .sort({$natural: -1})
                .limit(5)
                .then((games) => {
                    cb(null, games);
                })
                .catch((e) => {
                    cb(e);
                });
        },
        schess: function(cb) {
            //get last 5 schess games
            SChessDB.find({ $or : [ { "white.user_id": ObjectID(id)}, { "black.user_id": ObjectID(id) } ] } )
                .populate('black.user_id')
                .populate('white.user_id')
                .sort({$natural: -1})
                .limit(5)
                .then((games) => {
                    cb(null, games);
                })
                .catch((e) => {
                    cb(e);
                });
        },
        crazyhouse: function(cb) {
            //get last 5 crazyhouse games
            CrazyhouseGame.find({ $or : [ { "white.user_id": ObjectID(id)}, { "black.user_id": ObjectID(id) } ] } )
                .populate('black.user_id')
                .populate('white.user_id')
                .sort({$natural: -1})
                .limit(5)
                .then((games) => {
                    cb(null, games);
                })
                .catch((e) => {
                    cb(e);
                });
        },
        crazyhouse960: function(cb) {
            //get last 5 crazyhouse games
            Crazyhouse960Game.find({ $or : [ { "white.user_id": ObjectID(id)}, { "black.user_id": ObjectID(id) } ] } )
                .populate('black.user_id')
                .populate('white.user_id')
                .sort({$natural: -1})
                .limit(5)
                .then((games) => {
                    cb(null, games);
                })
                .catch((e) => {
                    cb(e);
                });
        },
        
    }
    
    Async.parallel (recentGames, function (err, results) {

        if (err) { console.log(err); res.status(400).send(err);}
    
        //results holds the leaderboard object
        res.send(results);

    });
}

