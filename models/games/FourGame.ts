import Game from './Game';
const Elo = require('elo-js');
const {FourChess} = require('../../common/fourchess');
import Player from '../players/Player';
import FourEngine from '../../engine/FourEngine';

function mapObject(object, callback) {
    return Object.keys(object).map(function (key) {
        return callback(key, object[key]);
    });
}

function getTimeTypeForTimeControl(time) {
    if(!time || !time.value || !time.increment) {
        return;
    }
    let tcIndex;
    //this time estimate is based on an estimated game length of 35 moves
    let totalTimeMs = (time.value * 60 * 1000) + (35 * time.increment * 1000);
    
    //four player cutoff times
    let fourMins = 240000;
    let twelveMins = 720000;
    let twentyMins = 12000000;
    
    if (totalTimeMs <= fourMins) {
        //bullet
        tcIndex = 'bullet';
    } else if (totalTimeMs <= twelveMins) {
        //blitz
        tcIndex = 'blitz';
    } else if (totalTimeMs <= twentyMins) {
        //rapid
        tcIndex = 'rapid';
    } else {
        //classical
        tcIndex = 'classic';
    }
    return tcIndex;

}

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
    time: any;
    
    constructor(io: Object, roomName:string, time: any) {
        super();
        this.io = io;
        this.gameRulesObj = new FourChess();
        this.roomName = roomName;
        this.time = time;
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
    
    setPlayerResignByPlayerObj(player: Player) {
        if(player.type == 'computer') { //Only remove human players
            return;
        }
        if(this.white && this.white.playerId === player.playerId) {
            this.white.alive = false;
            this.gameRulesObj.setWhiteOut();
            
            if (this.gameRulesObj.turn() == 'w') {
                this.gameRulesObj.nextTurn();
            }
        }
        
        if(this.black && this.black.playerId === player.playerId) {
            this.black.alive = false;
            this.gameRulesObj.setBlackOut();
            
            if (this.gameRulesObj.turn() == 'b') {
                this.gameRulesObj.nextTurn();
            }
        }
        
        if(this.gold && this.gold.playerId === player.playerId) {
            this.gold.alive = false;
            this.gameRulesObj.setGoldOut();
            
            if (this.gameRulesObj.turn() == 'g') {
                this.gameRulesObj.nextTurn();
            }
        }
        
        if(this.red && this.red.playerId === player.playerId) {
            this.red.alive = false;
            this.gameRulesObj.setRedOut();
            
            if (this.gameRulesObj.turn() == 'r') {
                this.gameRulesObj.nextTurn();
            }
        }
        
        //calculate the time difference between the last move
        let timeElapsed = Date.now() - this.lastMoveTime;
        this.lastMoveTime = Date.now();
        
        this.setColorTime(this._lastTurn, this.times[this._lastTurn] - timeElapsed);
        
        //check to see if the game is over
        if (this.gameRulesObj.game_over()) {
    
            
            if (this.gameRulesObj.in_draw()) {
                
            } else {
                this.endAndSaveGame();
                return;
            }
        }
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
        if(this.engineInstance && typeof this.engineInstance.kill == 'function') {
            this.engineInstance.kill(); //stop any active engine
        }
        
        let white : Player = this.white;
        let black : Player = this.black;
        let gold : Player = this.gold;
        let red : Player = this.red;
        
        if( white.type == 'computer' || black.type == 'computer'
            || gold.type == 'computer' || red.type == 'computer') {
            //Dont save computer games
        } else {
            setTimeout( function() {
                //update all player's elos
                let elo = new Elo();
                
                let winnerColor = this.gameRulesObj.getWinnerColor(); //player that won
                
                //order in which losers lost
                let loserOrder = this.gameRulesObj.getLoserOrder(); 
                delete loserOrder[winnerColor]; //remove the winner from the loser order
                
                let firstOut, secondOut, thirdOut;
                
                mapObject(loserOrder, function (key, player) {
                    if(player === 1) {
                        firstOut = this.getPlayer(key);
                    } else if(player === 2) {
                        secondOut = this.getPlayer(key);
                    } else if(player === 3) {
                        thirdOut = this.getPlayer(key);
                    }
                }.bind(this));
                
                console.log('here')
                
                console.log('firstOut ', firstOut);
                console.log('secondOut ', secondOut);
                console.log('thirdOut ', thirdOut);
                
                if(!firstOut || !secondOut || !thirdOut) {
                    return false;
                }
                
                
                
                let timeType = getTimeTypeForTimeControl(this.time);
                
                if(!timeType) {
                    return false;
                }
                
                //get appropriate elos for the time control
                let firstOutElo = white.fourplayer_ratings[timeType];
                console.log('firstOutElo ', firstOutElo);
            }.bind(this), 1000);
        }
        
        this.removePlayer('w');
        this.removePlayer('b');
        this.removePlayer('g');
        this.removePlayer('r');
        this.gameStarted = false;
        this.gameRulesObj = new FourChess();
        
        return true;
    }
    
}