const _ = require('lodash');
const {ObjectID} = require('mongodb');
const {User} = require('../models/user');
var Async = require('async');

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

exports.getLeaderboard = (req, res, next) => {

    let leaderboard = {
        standardBullet: function(cb) {
            User.find({}).sort({"standard_ratings.bullet": -1}).limit(10).then((data) => {
                cb(null, data)
            }).catch((e) => {
                cb(e); 
            });
        }.bind(this),
        standardBlitz: function(cb) {
            User.find({}).sort({"standard_ratings.blitz": -1}).limit(10).then((data) => {
                cb(null, data)
            }).catch((e) => {
                cb(e); 
            });
        },
        standardRapid: function(cb) {
            User.find({}).sort({"standard_ratings.rapid": -1}).limit(10).then((data) => {
                cb(null, data)
            }).catch((e) => {
                cb(e); 
            });
        },
        standardClassical: function(cb) {
            User.find({}).sort({"standard_ratings.classical": -1}).limit(10).then((data) => {
                cb(null, data)
            }).catch((e) => {
                cb(e); 
            });
        },
        
        schessBullet: function(cb) {
            User.find({}).sort({"schess_ratings.bullet": -1}).limit(10).then((data) => {
                cb(null, data)
            }).catch((e) => {
                cb(e); 
            });
        },
        schessBlitz: function(cb) {
            User.find({}).sort({"schess_ratings.blitz": -1}).limit(10).then((data) => {
                cb(null, data)
            }).catch((e) => {
                cb(e); 
            });
        },
        schessRapid: function(cb) {
            User.find({}).sort({"schess_ratings.rapid": -1}).limit(10).then((data) => {
                cb(null, data)
            }).catch((e) => {
                cb(e); 
            });
        },
        schessClassical: function(cb) {
            User.find({}).sort({"schess_ratings.classical": -1}).limit(10).then((data) => {
                cb(null, data)
            }).catch((e) => {
                cb(e); 
            });
        },
        
        zhBullet: function(cb) {
            User.find({}).sort({"crazyhouse_ratings.bullet": -1}).limit(10).then((data) => {
                cb(null, data)
            }).catch((e) => {
                cb(e); 
            });
        },
        zhBlitz: function(cb) {
            User.find({}).sort({"crazyhouse_ratings.blitz": -1}).limit(10).then((data) => {
                cb(null, data)
            }).catch((e) => {
                cb(e); 
            });
        },
        zhRapid: function(cb) {
            User.find({}).sort({"crazyhouse_ratings.rapid": -1}).limit(10).then((data) => {
                cb(null, data)
            }).catch((e) => {
                cb(e); 
            });
        },
        zhClassical: function(cb) {
            User.find({}).sort({"crazyhouse_ratings.classical": -1}).limit(10).then((data) => {
                cb(null, data)
            }).catch((e) => {
                cb(e); 
            });
        },
        
        zh960Bullet: function(cb) {
            User.find({}).sort({"crazyhouse960_ratings.bullet": -1}).limit(10).then((data) => {
                cb(null, data)
            }).catch((e) => {
                cb(e); 
            });
        },
        zh960Blitz: function(cb) {
            User.find({}).sort({"crazyhouse960_ratings.blitz": -1}).limit(10).then((data) => {
                cb(null, data)
            }).catch((e) => {
                cb(e); 
            });
        },
        zh960Rapid: function(cb) {
            User.find({}).sort({"crazyhouse960_ratings.rapid": -1}).limit(10).then((data) => {
                cb(null, data)
            }).catch((e) => {
                cb(e); 
            });
        },
        zh960Classical: function(cb) {
            User.find({}).sort({"crazyhouse960_ratings.classical": -1}).limit(10).then((data) => {
                cb(null, data)
            }).catch((e) => {
                cb(e); 
            });
        },
        
        fourplayerBullet: function(cb) {
            User.find({}).sort({"fourplayer_ratings.bullet": -1}).limit(10).then((data) => {
                cb(null, data)
            }).catch((e) => {
                cb(e); 
            });
        },
        fourplayerBlitz: function(cb) {
            User.find({}).sort({"fourplayer_ratings.blitz": -1}).limit(10).then((data) => {
                cb(null, data)
            }).catch((e) => {
                cb(e); 
            });
        },
        fourplayerRapid: function(cb) {
            User.find({}).sort({"fourplayer_ratings.rapid": -1}).limit(10).then((data) => {
                cb(null, data)
            }).catch((e) => {
                cb(e); 
            });
        },
        fourplayerClassical: function(cb) {
            User.find({}).sort({"fourplayer_ratings.classical": -1}).limit(10).then((data) => {
                cb(null, data)
            }).catch((e) => {
                cb(e); 
            });
        },
        
    }


    Async.parallel (leaderboard, function (err, results) {

        if (err) {console.log(err); res.status(400).send();}
    
        //results holds the leaderboard object
        res.send(results);

    });
}
