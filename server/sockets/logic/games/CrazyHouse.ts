import Game from './Game';
const {Crazyhouse} = require('crazyhouse.js');
import Player from '../players/Player';

export default class CrazyHouse implements Game {
    gameType: string = 'crazyhouse';
    gameRulesObj: any = new Crazyhouse();
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