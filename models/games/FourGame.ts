import Game from './Game';
const {FourChess} = require('../../common/fourchess');
import Player from '../players/Player';

export default class FourGame extends Game {
    gameType: string = 'four-player';
    gameRulesObj: any = null;
    numPlayers: number = 4;
    io: Object;
    white: Player = null;
    black: Player = null;
    gold: Player = null;
    red: Player = null;
    times: Object = {
        w: 0,
        b: 0,
        g: 0,
        r: 0
    }
    
    constructor(io: Object) {
        super();
        this.io = io;
        this.gameRulesObj = new FourChess();
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
        switch(color.charAt(0)) {
            case 'w':
                this.white = player;
                break;
            case 'b':
                this.black = player;
                break;
            case 'g':
                this.gold = player;
                break;
            case 'r':
                this.red = player;
                break;
        }
        return false;
    }
    
    removePlayer(color: string) {
        switch(color.charAt(0)) {
            case 'w':
                this.white = null;
                break;
            case 'b':
                this.black = null;
                break;
            case 'g':
                this.gold = null;
                break;
            case 'r':
                this.red = null;
                break;
        }
        return true;
    }
    
    gameReady(): boolean {
        return (
            this.white !== null &&
            this.black !== null &&
            this.gold !== null &&
            this.red !== null);
    }
    
}