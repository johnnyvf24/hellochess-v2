import Game from './Game';
const {Chess} = require('chess.js');
import Player from '../players/Player';

export default class Standard implements Game {
    gameType: string = 'standard';
    gameRulesObj: any = new Chess();
    numPlayers: number = 2;
    io: Object;
    
    constructor(io: Object) {
        this.io = io;
    }
    
    getGame() {
        return {
            numPlayers: this.numPlayers,
            gameType: this.gameType,
            fen: this.gameRulesObj.fen(),
            pgn: this.gameRulesObj.pgn()
        };
    }
    
    move() {
        
    }
    
    addPlayer(player: Player, color: string) {
        return false;
    }
}