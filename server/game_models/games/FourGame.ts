const Notifications = require('react-notification-system-redux');
import Connection from '../../sockets/Connection';
import Game from './Game';
const {User} = require('../../models/user');
const {FourGameDB} = require('../../models/fourgame');
const Elo = require('elo-js');
const {FourChess} = require('../../../common/fourchess');
import Player from '../players/Player';
import FourEngine from '../../engine/FourEngine';
import Engine from '../../engine/Engine';
import AI from '../players/AI';
import Room from '../rooms/Room';
import {EliminationMessage, DrawMessage, WinnerMessage} from '../rooms/Message';

function mapObject(object, callback) {
    return Object.keys(object).map(function (key) {
        return callback(key, object[key]);
    });
}

function getTimeTypeForTimeControl(time) {
    if(!time || !time.value) {
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
    io: any;
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
    connection: Connection;
    fenHistory: String[] = [];
    
    constructor(io: Object, roomName:string, time: any, connection: Connection) {
        super();
        this.io = io;
        this.gameRulesObj = new FourChess();
        this.roomName = roomName;
        this.time = time;
        let initialTime = time.value * 60 * 1000;
        this.times = {
            w: initialTime,
            b: initialTime,
            g: initialTime,
            r: initialTime
        };
        this.connection = connection;
    }
    
    startGame() {
        this.gameStarted = true;
        this.white.alive = true;
        this.black.alive = true;
        this.gold.alive = true;
        this.red.alive = true;
        this.resetClocks();
        this.gameRulesObj = new FourChess();
        this.fenHistory = [];
    }
    
    resetClocks() {
        let initialTime = this.time.value * 60 * 1000;
        this.times = {
            w: initialTime,
            b: initialTime,
            g: initialTime,
            r: initialTime
        };
    }
    
    // parse the pgn string into an array of move objects
    getMoveHistory() {
        let pgn: String = this.gameRulesObj.pgn().trim();
        if (typeof pgn === "undefined" || pgn.trim() === "")
            return [];
        let moves: String[] = pgn.split(" ");
        let moveObjects: any[] = moves.map((move, index) => {
            let color, san, from, to;
            [color, san] = move.split(":");
            let captureMove = false;
            if (san.indexOf("-") > -1) {
                [from, to] = san.split("-");
            } else if (san.indexOf("x") > -1) {
                [from, to] = san.split("x");
                captureMove = true;
            }
            let fen: String = this.fenHistory[index];
            let moveObject: any = {
                color: color,
                san: san,
                from: from,
                to: to,
                fen: fen
            };
            if (captureMove) {
                moveObject.captured = true;
            }
            return moveObject;
        });
        return moveObjects;
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
        
        if (this.lastMoveTime) {
            //calculate the time difference between the last move
            let timeElapsed = Date.now() - this.lastMoveTime;
            this.lastMoveTime = Date.now();
            
            this.setColorTime(this._lastTurn, this.times[this._lastTurn] - timeElapsed);
        }
        
        //check to see if the game is over
        if (this.gameRulesObj.game_over()) {
    
            
            if (this.gameRulesObj.in_draw()) {
                this.endAndSaveGame(true);
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
    
    makeMove(move: any, increment: number, moveTime: number): void {
        this._lastTurn = this.gameRulesObj.turn();
        if (this.times[this._lastTurn] <= 0) {
            this.setPlayerOutByColor(this._lastTurn);
            return;
        }
        let validMove = this.gameRulesObj.move(move);
        //set the last move made
        this._lastMove = move;
        // save the fen so it can be attached to this move in the move history
        this.fenHistory.push(this.gameRulesObj.fen());
        
        if(validMove == null) {
            return;
        } else  { //the move was valid
            if(validMove.color) { // A player was eliminated
                this.setPlayerOutByColor(validMove.color);
            }
            
            if(this.gameRulesObj.inCheckMate()) { //this player is in checkmate
                if(this.roomName) {
                    let currentPlayer = this.currentTurnPlayer();
                }
                this.gameRulesObj.nextTurn();
            }
        }
        
        /*
        // calculate the lag between the time the player moved
        // and the time the server received the move
        let lag = Date.now() - moveTime;
        lag = Math.max(0, lag);
        lag = Math.min(lag, 1000);
        //calculate the time difference between the last move
        */
        if (this.lastMoveTime) {
            let timeElapsed = Date.now() - this.lastMoveTime;// - lag;
            this.lastMoveTime = Date.now();//moveTime;
            
            //calculate the time increment and add it to the current players time
            let timeIncrement = increment * 1000;
            this.setColorTime(this._lastTurn, this.times[this._lastTurn] - timeElapsed + timeIncrement);
        }
        
        //check to see if the game is over
        if (this.gameRulesObj.game_over()) {
            if (this.gameRulesObj.in_draw()) {
                this.endAndSaveGame(true);
            } else {
                this.endAndSaveGame();
                return;
            }
        }
        
        this._currentTurn = this.gameRulesObj.turn();
        // if the next player is an AI, start the engine
        if (this.currentTurnPlayer() instanceof AI) {
            setTimeout(() => this.engineGo(), 100); // add a small delay between AI's moving
        }
    }
    
    endAndSaveGame(draw = false): boolean {
        if(this.engineInstance && typeof this.engineInstance.kill == 'function') {
            this.engineInstance.kill(); //stop any active engine
        }
        
        let white : Player = this.white;
        let black : Player = this.black;
        let gold : Player = this.gold;
        let red : Player = this.red;
        
        if(!white || !black || !red || !gold) {
            return;
        }
        let room = this.connection.getRoomByName(this.roomName);
        room.clearTimer();
        let winnerColor = this.gameRulesObj.getWinnerColor(); //player that won
        let winner = this.getPlayer(winnerColor);
        
        if (draw === true) {
            room.addMessage(new DrawMessage(null, null, this.roomName));
        } else if (this.gameStarted && winner && room) {
            room.addMessage(new WinnerMessage(winner, null, this.roomName));
        }
        
        if( white.type == 'computer' || black.type == 'computer'
            || gold.type == 'computer' || red.type == 'computer' 
            || draw === true) {
            //Dont save computer games
            //console.log("no ratings! Computer in game");
        } else {
            //update all player's elos
            let elo = new Elo();
            
            //order in which losers lost
            let loserOrder = this.gameRulesObj.getLoserOrder(); 
            //Used to store in the DB
            let loserOrderClone = JSON.parse(JSON.stringify(loserOrder)); 
            delete loserOrder[winnerColor]; //remove the winner from the loser order
            
            let firstOut : Player, secondOut : Player, thirdOut : Player;
            
            mapObject(loserOrder, function (key, player) {
                if(player === 1) {
                    firstOut = this.getPlayer(key);
                } else if(player === 2) {
                    secondOut = this.getPlayer(key);
                } else if(player === 3) {
                    thirdOut = this.getPlayer(key);
                }
            }.bind(this));
            
            if(!firstOut || !secondOut || !thirdOut || !winner) {
                this.removePlayer('w');
                this.removePlayer('b');
                this.removePlayer('g');
                this.removePlayer('r');
                this.gameStarted = false;
                this.gameRulesObj = new FourChess();
                console.log("One of the players is null");
                return;
        
            }
            let timeType = getTimeTypeForTimeControl(this.time);
            
            if(!timeType) {
                console.log("no timeType");
                return;
            }
            
            //get appropriate elos for the time control
            let firstOutElo = firstOut.fourplayer_ratings[timeType];
            let secondOutElo = secondOut.fourplayer_ratings[timeType];
            let thirdOutElo = thirdOut.fourplayer_ratings[timeType];
            let winnerElo = winner.fourplayer_ratings[timeType];
            
            //calculate average elo of the 3rd and 4th place
            let bottomAvgElo = (firstOutElo + secondOutElo) / 2;
            //calculate average elo of 1st and 2nd place
            let topAvgElo = (thirdOutElo + winnerElo) / 2;
            
            let wElo = elo.ifWins(topAvgElo, bottomAvgElo);
            let lElo = elo.ifLoses(bottomAvgElo, topAvgElo);
        
            let newFirstOutElo = Math.round((2 * (lElo-bottomAvgElo)) + firstOutElo);
            let newSecondOutElo = Math.round((lElo- bottomAvgElo) + secondOutElo);
            let newThirdOutElo = Math.round((wElo - topAvgElo) + thirdOutElo);
            let newWinnerElo = Math.round(((wElo - topAvgElo) * 2) + winnerElo);
            
            firstOut.fourplayer_ratings[timeType] = newFirstOutElo;
            secondOut.fourplayer_ratings[timeType] = newSecondOutElo;
            thirdOut.fourplayer_ratings[timeType] = newThirdOutElo;
            winner.fourplayer_ratings[timeType] = newWinnerElo;
            
            this.connection.updatePlayer(firstOut);
            this.connection.updatePlayer(secondOut);
            this.connection.updatePlayer(thirdOut);
            this.connection.updatePlayer(winner);
            
            let whiteElo = this.getPlayer('w').fourplayer_ratings[timeType];
            let blackElo = this.getPlayer('b').fourplayer_ratings[timeType];
            let goldElo = this.getPlayer('g').fourplayer_ratings[timeType];
            let redElo = this.getPlayer('r').fourplayer_ratings[timeType];
            
            let data = {
                white: {
                    "user_id": this.white.playerId, 
                    "elo": whiteElo
                    
                },
                black: {
                    "user_id": this.black.playerId,
                    "elo": blackElo
                },
                gold: {
                    "user_id": this.gold.playerId,
                    "elo": goldElo, 
                },
                red: {
                    "user_id": this.red.playerId,
                    "elo": redElo, 
                },
                loser_order: loserOrderClone,
                pgn: this.gameRulesObj.pgn(),
                final_fen: this.gameRulesObj.fen(),
                time: this.time,
            };
            let fourway_game = new FourGameDB(data);
            fourway_game.save().then((game) => {
                console.log('saved four player game ', game);
            }).catch(e => console.log(e));
            
            //send new ratings to each individual player
            setTimeout( function() {
                try {
                //save winner
                if (!winner.anonymous) {
                    User.findById({_id: winner.playerId})
                    .then( function (user) {
                        user.fourplayer_ratings[timeType] = newWinnerElo;
                        user.save( function(err, updatedUser) {
                            if(err) {
                                return;
                            }
                            let eloNotif = {
                                title: `${winner.username}'s elo is now ${newWinnerElo} ${newWinnerElo - winnerElo}`,
                                position: 'tr',
                                autoDismiss: 6,
                            };
                            
                            winner.socket.emit('action', Notifications.success(eloNotif));
                            firstOut.socket.emit('update-user', updatedUser);
                        }.bind(this));
                    }.bind(this)).catch(e => console.log(e));
                }
                
                //save second
                if (!thirdOut.anonymous) {
                    User.findById({_id: thirdOut.playerId})
                    .then( function (user) {
                        user.fourplayer_ratings[timeType] = newThirdOutElo;
                        user.save( function(err, updatedUser) {
                            if(err) {
                                return;
                            }
                            let eloNotif = {
                                title: `${thirdOut.username}'s elo is now ${newThirdOutElo} ${newThirdOutElo - thirdOutElo}`,
                                position: 'tr',
                                autoDismiss: 6,
                            };
                            
                            thirdOut.socket.emit('action', Notifications.success(eloNotif));
                            thirdOut.socket.emit('update-user', updatedUser);
                        }.bind(this));
                    }.bind(this)).catch(e => console.log(e));
                }
                
                //save third
                if (!secondOut.anonymous) {
                    User.findById({_id: secondOut.playerId})
                    .then( function(user) {
                        user.fourplayer_ratings[timeType] = newSecondOutElo;
                        user.save( function(err, updatedUser) {
                            if(err) {
                                return;
                            }
                            let eloNotif = {
                                title: `${secondOut.username}'s elo is now ${newSecondOutElo} ${newSecondOutElo - secondOutElo}`,
                                position: 'tr',
                                autoDismiss: 6,
                            };
                            
                            secondOut.socket.emit('action', Notifications.error(eloNotif));
                            secondOut.socket.emit('update-user', updatedUser);
                        }.bind(this));
                    }.bind(this)).catch(e => console.log(e));
                }
                
                //save last
                if (!firstOut.anonymous) {
                    User.findById({_id: firstOut.playerId})
                    .then( function(user) {
                        user.fourplayer_ratings[timeType] = newFirstOutElo;
                        user.save( function(err, updatedUser) {
                            if(err) {
                                return;
                            }
                            let eloNotif = {
                                title: `${firstOut.username}'s elo is now ${newFirstOutElo} ${newFirstOutElo - firstOutElo}`,
                                position: 'tr',
                                autoDismiss: 6,
                            };
                            firstOut.socket.emit('action', Notifications.error(eloNotif));
                            firstOut.socket.emit('update-user', updatedUser);
                        }.bind(this));
                    }.bind(this)).catch(e => console.log(e));
                }
                } catch(err) {
                    console.log(err);
                }
            }.bind(this), 1000);
        }
        this.gameStarted = false;
        this.lastMoveTime = null;

        //wait 3 seconds before resetting the room
        setTimeout(function() {
            this.removePlayer('w');
            this.removePlayer('b');
            this.removePlayer('g');
            this.removePlayer('r');
            
            if(!room) {
                return;
            }
            
            this.io.to(this.roomName).emit('update-room-full', room.getRoomObjFull());
        }.bind(this), 3000);
        
        return true;
    }
    
    gameOver(): boolean {
        return this.gameRulesObj.game_over();
    }
    
    setPlayerOutByColor(color: string) {
        let playerOut = null;
        switch(color.charAt(0)) {
            case 'w':
                this.white.alive = false;
                playerOut = this.white;
                this.times.w = 1;
                if(!this.gameRulesObj.isWhiteOut()) this.gameRulesObj.setWhiteOut();
                break;
            case 'b':
                this.black.alive = false;
                playerOut = this.black;
                this.times.b = 1;
                if(!this.gameRulesObj.isBlackOut()) this.gameRulesObj.setBlackOut();
                break;
            case 'g':
                this.gold.alive = false;
                playerOut = this.gold;
                this.times.g = 1;
                if(!this.gameRulesObj.isGoldOut()) this.gameRulesObj.setGoldOut();
                break;
            case 'r':
                if(!this.gameRulesObj.isRedOut()) this.gameRulesObj.setRedOut();
                this.red.alive = false;
                playerOut = this.red;
                this.times.r = 1;
                break;
        }
        if(playerOut) {
            let room = this.connection.getRoomByName(this.roomName);
            if (room)
                room.addMessage(new EliminationMessage(playerOut, null, this.roomName));
            this.lastMoveTime = Date.now();
        }
    }
    
}