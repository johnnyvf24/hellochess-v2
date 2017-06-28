import Game from './Game';
import {FullhouseChess as FullhouseChessGame} from '../../../common/fullhouse-chess';
const {User} = require('../../models/user');
const {FullhouseChessDB} = require('../../models/fullhouse-chess');
const Elo = require('elo-js');
import Player from '../players/Player';
import TwoEngine from '../../engine/TwoEngine';
const Notifications = require('react-notification-system-redux');
import Connection from '../../sockets/Connection';
import Room from '../rooms/Room';
import {DrawMessage, WinnerMessage} from '../rooms/Message';

export default class FullhouseChess extends Game {
    gameType: string = 'fullhouse-chess';
    gameRulesObj: any = FullhouseChessGame();
    numPlayers: number = 2;
    io: any;
    times: any = {
        w: 0,
        b: 0
    };
    time: any;
    connection: Connection;
    ratings_type: string = 'fullhouse_ratings';
    gameClassDB: any = FullhouseChessDB;
    
    constructor(io: Object, roomName:string, time: any, connection: Connection) {
        super();
        this.io = io;
        this.gameRulesObj = FullhouseChessGame();
        this.roomName = roomName;
        this.time = time;
        let initialTime = time.value * 60 * 1000;
        this.times = {
            w: initialTime,
            b: initialTime
        };
        this.connection = connection;
    }
    
    setPlayerResignByPlayerObj(player: Player) {
        if(this.white && this.white.playerId === player.playerId) {
            this.white.alive = false;
        }
        
        if(this.black && this.black.playerId === player.playerId) {
            this.black.alive = false;
        }
    }
    
    move() {
        
    }
    
    getGame() {
        return {
            numPlayers: this.numPlayers,
            gameType: this.gameType,
            fen: this.gameRulesObj.fen(),
            pgn: this.getMoveHistory(),
            move: this._lastMove,
            white: (this.white) ? this.white.getPlayer():false,
            black: (this.black) ? this.black.getPlayer():false,
            turn: this.gameRulesObj.turn(),
            gameStarted: this.gameStarted,
        };
    }
    
    
    removePlayerFromAllSeats(player: Player) {
        if(this.white && this.white.playerId === player.playerId) {
            this.white = null;
        }
        
        if(this.black && this.black.playerId === player.playerId) {
            this.black = null;
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
        // this.engineInstance = new TwoEngine(roomName, this.time.increment, this.connection);
    }
    
    startGame() {
        this.gameStarted = true;
        this.white.alive = true;
        this.black.alive = true;
        this.resetClocks();
        this.gameRulesObj = FullhouseChessGame();
        this.moveHistory = [];
    }
    
    
    setPlayerOutByColor(color: string) {
        let playerOut = null;
        switch(color.charAt(0)) {
            case 'w':
                this.white.alive = false;
                playerOut = this.white;
                break;
            case 'b':
                this.black.alive = false;
                playerOut = this.black;
                break;
        }
    }

}