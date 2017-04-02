import Game from './Game';
const {Crazyhouse} = require('crazyhouse.js');
import Player from '../players/Player';
import CrazyEngine from '../../engine/CrazyEngine';

export default class CrazyHouse extends Game {
    gameType: string = 'crazyhouse';
    gameRulesObj: any = new Crazyhouse();
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
        this.engineInstance = new CrazyEngine(roomName, io, this.timeControl.increment);
    }
}