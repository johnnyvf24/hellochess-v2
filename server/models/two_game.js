const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var TwoGameSchema = new Schema({
    white: {
        user_id: {
            type: Number,
            required: true,
        },
        elo: {
            type: String,
            required: true
        }
    },
    black: {
        user_id: {
            type: Number,
            required: true,
        },
        elo: {
            type: String,
            required: true
        }
    },
    pgn: {
        type: String,
        required: true
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
    winner: {
        type: String,
        required: true
    }
});

var TwoGame = mongoose.model('TwoGame', TwoGameSchema);

module.exports = {TwoGame};
