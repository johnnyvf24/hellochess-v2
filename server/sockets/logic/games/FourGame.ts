import Game from './Game';
const {FourChess} = require('../../../../common/fourchess');
import Player from '../players/Player';

export default class FourGame implements Game {
    gameType: string = 'four-player';
    gameRulesObj: any = null;
    numPlayers: number = 4;
    io: Object;
    
    constructor(io: Object) {
        this.io = io;
        this.gameRulesObj = new FourChess();
    }
    
    getGame() {
        return {
            numPlayers: 4,
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