import Game from './Game';
const {Crazyhouse} = require('crazyhouse.js');
const {User} = require('../../models/user');
const {CrazyhouseGame} = require('../../models/crazyhouse');
const {Crazyhouse960Game} = require('../../models/crazyhouse960');
const Elo = require('elo-js');
import Player from '../players/Player';
import CrazyEngine from '../../engine/CrazyEngine';
const Notifications = require('react-notification-system-redux');
import Connection from '../../sockets/Connection';
import Room from '../rooms/Room';
import {DrawMessage, WinnerMessage} from '../rooms/Message';

function getTimeTypeForTimeControl (time) {
    let tcIndex;
    //this time estimate is based on an estimated game length of 35 moves
    let totalTimeMs = (time.value * 60 * 1000) + (35 * time.increment * 1000);

    //Two player cutoff times
    let twoMins = 120000; //two minutes in ms
    let eightMins = 480000;
    let fifteenMins = 900000;

    //four player cutoff times
    let fourMins = 240000;
    let twelveMins = 720000;
    let twentyMins = 12000000;

    if (totalTimeMs <= twoMins) {
        //bullet
        tcIndex = 'bullet';
    } else if (totalTimeMs <= eightMins) {
        //blitz
        tcIndex = 'blitz';
    } else if (totalTimeMs <= fifteenMins) {
        //rapid
        tcIndex = 'rapid';
    } else {
        //classical
        tcIndex = 'classic';
    }
    return tcIndex;
}

export default class CrazyHouse extends Game {
    gameType: string = 'crazyhouse';
    gameRulesObj: any = new Crazyhouse();
    startPos: string;
    numPlayers: number = 2;
    io: any;
    times: any = {
        w: 0,
        b: 0
    };
    time: any;
    set_960: boolean = false;
    connection: Connection;
    ratings_type: string = "crazyhouse_ratings";
    gameClassDB: any = CrazyhouseGame;
    
    constructor(io: Object, roomName:string, time: any, set_960: boolean, connection: Connection) {
        super();
        this.io = io;
        this.roomName = roomName;
        this.time = time;
        let initialTime = time.value * 60 * 1000;
        this.times = {
            w: initialTime,
            b: initialTime
        };
        this.connection = connection;
        this.set_960 = set_960;
        if(set_960) {
            this.gameType = 'crazyhouse960';
            this.ratings_type = "crazyhouse960_ratings";
            this.gameRulesObj = new Crazyhouse({960: true});
            this.gameClassDB = Crazyhouse960Game;
        } else {
            this.gameRulesObj = new Crazyhouse(); 
        }
    }
    
    
    setPlayerResignByPlayerObj(player: Player) {
        if(this.white && this.white.playerId === player.playerId) {
            this.white.alive = false;
        }
        
        if(this.black && this.black.playerId === player.playerId) {
            this.black.alive = false;
        }
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
            startPos: this.startPos
        };
    }
    
    move() {
        
    }
    
    removePlayerFromAllSeats(player: Player) {
        if(this.white && this.white.playerId === player.playerId) {
            this.white = null;
        }
        
        if(this.black && this.black.playerId === player.playerId) {
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
        this.engineInstance = new CrazyEngine(roomName, this.time.increment, this.connection, this.set_960);
    }
    
    startGame() {
        this.gameStarted = true;
        this.white.alive = true;
        this.black.alive = true;
        this.resetClocks();
        this.gameRulesObj = new Crazyhouse({960: this.set_960});
        if (this.set_960) {
            this.startPos = this.gameRulesObj.fen();
        }
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