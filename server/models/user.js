const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');
const config = require('../../config/config');

var UserSchema = new Schema({
    username: {
        type: String,
        lowercase: true,
        trim: true,
        minlength: 3,
        maxlength: 15,
    },
    email: {
        type: String,
        lowercase: true,
        trim: true,
        minlength: 3,
        unique: true,
        validate: {
            validator: validator.isEmail,
            message: '{VALUE} is not a valid email'
        }
    },
    password: {
        type: String,
        minlength: 6,
        select: false
    },
    picture: {
        type: String,
        default: 'https://www.hellochess.com/img/default-img.png'
    },
    name: {
        type: String,
        trim: true
    },
    social: {
        type: Boolean,
        default: false
    },
    standard_ratings: {
        bullet: {
            type: Number,
            default: 1200
        },
        blitz: {
            type: Number,
            default: 1200
        },
        rapid: {
            type: Number,
            default: 1200
        },
        classic: {
            type: Number,
            default: 1200
        }
    },
    fourplayer_ratings: {
        bullet: {
            type: Number,
            default: 1200
        },
        blitz: {
            type: Number,
            default: 1200
        },
        rapid: {
            type: Number,
            default: 1200
        },
        classic: {
            type: Number,
            default: 1200
        }
    },
    crazyhouse_ratings: {
        bullet: {
            type: Number,
            default: 1200
        },
        blitz: {
            type: Number,
            default: 1200
        },
        rapid: {
            type: Number,
            default: 1200
        },
        classic: {
            type: Number,
            default: 1200
        }
    },
    crazyhouse960_ratings: {
        bullet: {
            type: Number,
            default: 1200
        },
        blitz: {
            type: Number,
            default: 1200
        },
        rapid: {
            type: Number,
            default: 1200
        },
        classic: {
            type: Number,
            default: 1200
        }
    },
    socket_id: {
        type: String
    },
    socialProvider: {
        name: String,
        id: String
    },
    tokens: [{
        access: {
            type: String,
            required: true,
        },
        token: {
            type: String,
            required: true,
        },
        select: false
    }]
});

UserSchema.methods.toJSON = function() {
    var user = this;
    var userObject = user.toObject();

    return _.pick(userObject, [
        '_id',
        'picture',
        'email',
        'username',
        'social',
        'standard_ratings',
        'fourplayer_ratings',
        'crazyhouse_ratings',
        'crazyhouse960_ratings'
    ]);
};

UserSchema.methods.generateAuthToken = function() {
    var user = this;
    var access = 'auth';
    const timestamp = new Date().getTime();
    var token = jwt.sign({ sub: user._id.toHexString(), iat: timestamp, access}, config.secret).toString();

    user.tokens = [];
    user.tokens.push({access, token});

    return user.save().then(() => {
        return token;
    });
};

UserSchema.methods.comparePassword = function(candidatePassword, callback) {
    var User = this;
    bcrypt.compare(candidatePassword, User.password, (err, res) => {
        if(err) {
            return callback(err);
        }

        callback(null, res);
    });
};


//Before saving hash and salt passwords
UserSchema.pre('save', function(next) {
    var user = this;

    if (user.isModified('password')) {
        //generate a salt
        bcrypt.genSalt(11, (err, salt) => {
            //hash using salt
            bcrypt.hash(user.password, salt, (err, hash) => {
                user.password = hash;
                next();
            });
        });
    } else {
        next();
    }
});

UserSchema.post('findOne', function(next) {
    var user = this;
    delete user.tokens;
    delete user.password;
});

var User = mongoose.model('User', UserSchema);

module.exports = {User};
