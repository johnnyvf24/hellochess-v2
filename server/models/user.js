const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');
const config = require('../config');

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
        required: true,
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
        require: true,
        minlength: 6
    },
    tokens: [{
        access: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        }
    }]
});

UserSchema.methods.toJSON = function() {
    var user = this;
    var userObject = user.toObject();

    return _.pick(userObject, ['_id', 'username', 'email'])
};

UserSchema.methods.generateAuthToken = function() {
    var user = this;
    var access = 'auth';
    const timestamp = new Date().getTime();
    var token = jwt.sign({ sub: user._id.toHexString(), iat: timestamp, access}, config.secret).toString();

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

var User = mongoose.model('User', UserSchema);

module.exports = {User};
