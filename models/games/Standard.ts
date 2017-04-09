import Game from './Game';
const {Chess} = require('chess.js');
import Player from '../players/Player';
import TwoEngine from '../../engine/TwoEngine';
const Notifications = require('react-notification-system-redux');
import Connection from '../../server/sockets/Connection';

export default class Standard extends Game {
    gameType: string = 'standard';
    gameRulesObj: any = new Chess();
    numPlayers: number = 2;
    io: any;
    times: any = {
        w: 0,
        b: 0
    };
    time: any;
    connection: Connection;
    
    constructor(io: Object, roomName:string, time: any, connection: Connection) {
        super();
        this.io = io;
        this.gameRulesObj = new Chess();
        this.roomName = roomName;
        this.time = time;
        this.connection = connection;
    }
    
    
    setPlayerResignByPlayerObj(player: Player) {
        
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
            turn: this.gameRulesObj.turn(),
            gameStarted: this.gameStarted,
        };
    }
    
    move() {
        
    }
    
    removePlayerFromAllSeats(player: Player) {
        if(this.white && this.white.playerId === player.playerId) {
            this.removeColorTime('w');
            this.white = null;
        }
        
        if(this.black && this.black.playerId === player.playerId) {
            this.removeColorTime('b');
            this.black = null;
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
        }
        return true;
    }

    gameReady(): boolean {
        return (
            this.white !== null &&
            this.black !== null);
    }
    
    outColor(): string { return null; }
    
    newEngineInstance(roomName: string, io: any) {
        this.engineInstance = new TwoEngine(roomName, this.time.increment, this.connection);
    }
    
    startGame() {
        this.gameStarted = true;
        this.white.alive = true;
        this.black.alive = true;
        this.lastMoveTime = Date.now();
    }
    
    
    setPlayerOutByColor(color: string) {
        let playerOut = null;
        switch(color.charAt(0)) {
            case 'w':
                this.white.alive = false;
                playerOut = this.white;
                this.times.w = 1;
                break;
            case 'b':
                this.black.alive = false;
                playerOut = this.black;
                this.times.b = 1;
                break;
        }
    }

    endAndSaveGame(draw): boolean {
        
        let winner, loser;
        
        //get the loser and the winner
        if(!this.white.alive) {
            loser = this.white;
            winner = this.black;
        } else {
            loser = this.black;
            winner = this.white;
        }
        if(draw) {
            let drawNotif = {
                title: 'Game Over',
                message: 'The game has eneded in a draw!',
                position: 'tr',
                autoDismiss: 5
            }
            
            this.io.to(this.roomName).emit('action', Notifications.warning(drawNotif));
        } else {
            let endNotif = {
                title: 'Game Over',
                message: `The game is over, ${winner.username} has won!`,
                position: 'tr',
                autoDismiss: 5
            }
            
            this.io.to(this.roomName).emit('action', Notifications.info(endNotif));
        }
        
        this.removePlayer('w');
        this.removePlayer('b');
        this.gameStarted = false;
        this.gameRulesObj = new Chess(); 
        
        return true;
    }
}