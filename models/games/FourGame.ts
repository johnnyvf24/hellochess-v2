import Game from './Game';
const {FourChess} = require('../../common/fourchess');
import Player from '../players/Player';
import FourEngine from '../../engine/FourEngine';

export default class FourGame extends Game {
    gameType: string = 'four-player';
    numPlayers: number = 4;
    io: Object;
    white: Player = null;
    black: Player = null;
    gold: Player = null;
    red: Player = null;
    times: any = {
        w: 0,
        b: 0,
        g: 0,
        r: 0
    };
    roomName: string;
    
    constructor(io: Object, roomName:string) {
        super();
        this.io = io;
        this.gameRulesObj = new FourChess();
        this.roomName = roomName;
    }
    
    startGame() {
        this.gameStarted = true;
        this.white.alive = true;
        this.black.alive = true;
        this.gold.alive = true;
        this.red.alive = true;
        this.lastMoveTime = Date.now();
    }
    
    getGame() {
        return {
            numPlayers: this.numPlayers,
            gameType: this.gameType,
            fen: this.gameRulesObj.fen(),
            pgn: this.gameRulesObj.pgn(),
            move: this._lastMove,
            white: (this.white) ? this.white.getPlayer():false,
            black: (this.black) ? this.black.getPlayer():false,
            gold: (this.gold) ? this.gold.getPlayer():false,
            red: (this.red) ? this.red.getPlayer():false,
            turn: this.gameRulesObj.turn(),
            gameStarted: this.gameStarted,
        };
    }
    
    move() {
        
    }
    
    removePlayerFromAllSeats(player: Player) {
        if(player.type == 'computer') { //Only remove human players
            return;
        }
        if(this.white && this.white.playerId === player.playerId) {
            this.removeColorTime('w');
            this.white = null;
        }
        
        if(this.black && this.black.playerId === player.playerId) {
            this.removeColorTime('b');
            this.black = null;
        }
        
        if(this.gold && this.gold.playerId === player.playerId) {
            this.removeColorTime('g');
            this.gold = null;
        }
        
        if(this.red && this.red.playerId === player.playerId) {
            this.removeColorTime('r');
            this.red = null;
        }
    }
    
    addPlayer(player: Player, color: string) {
        this.removePlayerFromAllSeats(player);
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
    
    getPlayer(playerColor: string) {
        switch(playerColor.charAt(0)) {
            case 'w':
                return this.white;
            case 'b':
                return this.black;
            case 'g':
                return this.gold;
            case 'r':
                return this.red;
        }
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
    
    outColor(): string {
        if (this._lastMove.hasOwnProperty('color') && this._lastMove.color !== null) {
            return this._lastMove.color;
        }
    }
    
    newEngineInstance(roomName: string, connection: any) {
        this.engineInstance = new FourEngine(roomName, connection);
    }
    
    
    endAndSaveGame(): boolean {
        this.gameStarted = false;
        return true;
    }
    
}