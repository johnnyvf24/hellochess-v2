import Game from './Game';
const {Chess} = require('chess.js');
import Player from '../players/Player';
import TwoEngine from '../../engine/TwoEngine';

export default class Standard extends Game {
    gameType: string = 'standard';
    gameRulesObj: any = new Chess();
    numPlayers: number = 2;
    io: Object;
    times: Object = {
        w: 0,
        b: 0
    }
    
    constructor(io: Object) {
        super();
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
    
    addPlayer(player: Player, color: string) {
        return false;
    }
    
    removePlayer(color: String): boolean {
        return false;
    }
    
    gameReady(): boolean {
        return (
            this.white !== null &&
            this.black !== null);
    }
    
    outColor(): string { return null; }
    
    newEngineInstance(roomName: string, io: any) {
        this.engineInstance = new TwoEngine(roomName, io, this.timeControl.increment);
    }
}