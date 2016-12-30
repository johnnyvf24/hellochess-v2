var mongoose = require('mongoose');

var TwoGame = mongoose.model('TwoGame', {
    completed: {
        type: Boolean,
        default: false
    },
    final_fen: {
        type: String
    }
});

module.exports = {TwoGame};
