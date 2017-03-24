import Game from './Game';
const {Chess} = require('chess.js');
import Player from '../players/Player';

module.exports = class Standard implements Game {
    gameType: string = 'standard';
    gameRulesObj: Object = new Chess();
    numPlayers: number = 2;
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