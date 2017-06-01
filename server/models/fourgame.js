const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var FourWaySchema = new Schema({
    white: {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User'
        },
        elo: {
            type: Number,
            required: true
        }
    },
    black: {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User'
        },
        elo: {
            type: Number,
            required: true
        }
    },
    gold: {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User'
        },
        elo: {
            type: Number,
            required: true
        }
    }, 
    red: {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User'
        },
        elo: {
            type: Number,
            required: true
        }
    },
    pgn: {
        type: String,
        required: true,
    },
    final_fen: {
        type: String,
        rquired: true
    },
    time: {
        value: {
            type: Number,
            required: true
        },
        increment: {
            type: Number,
            required: true
        }
    },
    //Loser order fourth, third, second, first. e.g. {w: 1, g: 2, b: 3, r: 4} 
    //implying white lost first and red won
    loser_order: {
        w: {
            type: Number,
            required: true
        },
        b: {
            type: Number,
            required: true
        },
        g: {
            type: Number,
            required: true,
        },
        r: {
            type: Number,
            required: true,
        },
    }
});

var FourGameDB = mongoose.model('FourWay', FourWaySchema);

module.exports = {FourGameDB};
