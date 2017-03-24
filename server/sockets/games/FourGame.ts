import Game from './Game';
const {FourChess} = require('../../../common/fourchess');
import Player from '../players/Player';

module.exports = class FourGame implements Game {
    gameType: string = 'four-player';
    gameRulesObj: Object = new FourChess();
    numPlayers: number = 4;
    io: Object;
    
    constructor(io: Object) {
        this.io = io;
    }
    
    move() {
        
    }
    
    addPlayer(player: Player, color: string) {
        return false;
    }
}