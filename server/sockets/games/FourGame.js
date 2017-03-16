const Game = require('./game.js');
const {FourChess} = require('../../../common/fourchess');

module.exports = class FourGame extends Game {
    constructor() {
        super(4, 'four-player', new FourChess());
    }
}