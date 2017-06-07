const Notifications = require('react-notification-system-redux');
import Player from '../players/Player';
import Engine from '../../engine/Engine';
import AI from '../players/AI';
import Connection from '../../sockets/Connection';
import Room from '../rooms/Room';
const Elo = require('elo-js');
const {User} = require('../../models/user');
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

abstract class Game {
    public static COLOR_SHORT_TO_LONG: any =
        {
            'w': 'white',
            'b': 'black',
            'r': 'red',
            'g': 'gold'
        };
    public static COLOR_LONG_TO_SHORT: any =
        {
            'white': 'w',
            'black': 'b',
            'red': 'r',
            'gold': 'g'
        };
    public white: Player = null;
    public black: Player = null;
    public gold: Player = null;
    public red: Player = null;
    engineInstance: Engine;
    io: any;
    numPlayers: number;
    gameType: string;
    gameRulesObj: any;
    times: any;
    _lastMove: any;
    _lastMoveTime: any;
    _lastTurn: string = 'b';
    _currentTurn: string;
    gameStarted: boolean = false;
    roomName: string;
    room: Room;
    time: any;
    connection: Connection;
    moveHistory: any[] = [];
    ratings_type: string;
    startPos: string;
    gameClassDB: any;
    
    abstract addPlayer(player: Player, color: string): boolean;
    abstract removePlayer(color: string): boolean;
    abstract getGame(): any;
    abstract gameReady(): boolean;
    abstract outColor(): string;
    abstract newEngineInstance(roomName: string, io: any): void;
    abstract startGame(): any;
    abstract setPlayerResignByPlayerObj(player: Player);
    abstract removePlayerFromAllSeats(player: Player);
    abstract setPlayerOutByColor(color: string);
    
    resetClocks() {
        let initialTime = this.time.value * 60 * 1000;
        this.times = {
            w: initialTime,
            b: initialTime,
            g: initialTime,
            r: initialTime
        };
    }
    
    setColorTime(color: string, time: number): void {
        this.times[color] = time;
    }
    
    get lastMoveTime() {
        return this._lastMoveTime;
    }
    
    set lastMoveTime(time) {
        this._lastMoveTime = time;
    }
    
    get lastMove() {
        return this._lastMove;
    }
    
    set lastMove(move) {
        this._lastMove = move;
    }
    
    removeColorTime(color: string): void {
        this.times[color] = 0;
    }
    
    getColorTime(color: string): number {
        return this.times[color];
    }
    
    getCurrentTimes() {
        let times = {...this.times};
        if (this.lastMoveTime && this.gameStarted) {
            let currentTurn = this.gameRulesObj.turn();
            let currentTime = times[currentTurn];
            let timeElapsed = Date.now() - this.lastMoveTime;
            let updatedTime = currentTime - timeElapsed;
            times[this.gameRulesObj.turn()] = updatedTime;
        }
        return times;
    }
    
    get fen(): string {
        return this.gameRulesObj.fen();
    }
    
    get lastTurn(): string {
        return this._lastTurn;
    }
    
    get currentTurn(): string {
        return this._currentTurn;
    }
    
    getTurn(): string {
        return this.gameRulesObj.turn();
    }
    
    setNextTurn(): void {
        this.gameRulesObj.nextTurn();
    }
    
    prevPlayerTime(): number {
        return this.times[this.lastTurn];
    }
    
    gameOver(): boolean {
        return this.gameRulesObj.game_over() || !this.white.alive || !this.black.alive;
    }
    
    getPlayer(playerColor: string) : Player {
        switch(playerColor) {
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
    
    engineGo() {
        this.engineInstance.setPosition(this.gameRulesObj.fen());
        this.engineInstance.setTurn(this.gameRulesObj.turn());
        let playerTimeLeft = this.currentTurnTime();
        let currentPlayer = this.currentTurnPlayer();
        if(!currentPlayer) {
            return;
        }
        if(playerTimeLeft && currentPlayer.playerLevel) {

            if(this.white instanceof AI && this.black instanceof AI && this.gameType === 'schess') {
                this.engineInstance.go(playerTimeLeft, currentPlayer.playerLevel, true);
            }
            else {
                this.engineInstance.go(playerTimeLeft, currentPlayer.playerLevel, false);
            }
            
        }
    }
    
    killEngineInstance() {
        if(this.engineInstance) {
            this.engineInstance.kill();
        }
    }
    
    currentTurnPlayer(): Player {
        switch (this.gameRulesObj.turn()) {
            case 'w':
                return this.white;
            case 'b':
                return this.black;
            case 'g':
                return this.gold;
            case 'r':
                return this.red;
            default:
                return null;
        }
    }
    
    currentTurnTime() {
        return this.times[this.gameRulesObj.turn()];
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
        
        if(validMove == null) {
            return;
        }
        
        // save the move to move history
        validMove.fen = this.gameRulesObj.fen();
        this.moveHistory.push(validMove);
        
        /*
        // calculate the lag between the time the player moved
        // and the time the server received the move
        let lag = Date.now() - moveTime;
        lag = Math.max(0, lag);
        lag = Math.min(lag, 1000);
        // calculate the time difference between the last move.
        // subtract any lag up to 1 second.
        */
        let timeElapsed = Date.now() - this.lastMoveTime;// - lag;
        this.lastMoveTime = Date.now();//moveTime;
        
        //calculate the time increment and add it to the current players time
        let timeIncrement = increment * 1000;
        this.setColorTime(this._lastTurn, this.times[this._lastTurn] - timeElapsed + timeIncrement);
        
        //check to see if the game is over
        if (this.gameRulesObj.game_over()) {
            
            if (this.gameRulesObj.in_draw()) {
                
                this.endAndSaveGame(true);
                
            } else {
                this.setPlayerOutByColor(this.gameRulesObj.turn())
                this.endAndSaveGame(false);
            }
            
            return;
        }
        
        this._currentTurn = this.gameRulesObj.turn();
        // if the next player is an AI, start the engine
        if (this.currentTurnPlayer() instanceof AI) {
            setTimeout(() => this.engineGo(), 100); // add a small delay between AI's moving
        }
    }
    
    removePlayerByPlayerId(playerId: string) {
        if(this.white && playerId == this.white.playerId) {
            this.white = null;
        } else if(this.black && playerId == this.black.playerId) {
            this.black = null;
        } else if(this.gold && playerId == this.gold.playerId) {
            this.gold = null;
        } else if(this.red && playerId == this.red.playerId) {
            this.red = null;
        }
    }
    
    getMoveHistory() {
        return this.moveHistory;
    }
    
    abort() {
        if(this.engineInstance && typeof this.engineInstance.kill == 'function') {
            this.engineInstance.kill(); //stop any active engine
        }
        this.gameStarted = false;
        this.white = null;
        this.black = null;
        this.gold = null;
        this.red = null;
        let room: Room = this.connection.getRoomByName(this.roomName);
        
        if(!room) {
            return;
        }
        this.io.to(this.roomName).emit('update-room', room.getRoom());
    }
    
    endAndSaveGame(draw): boolean {
        if(this.engineInstance && typeof this.engineInstance.kill == 'function') {
            this.engineInstance.kill(); //stop any active engine
        }
        
        let winner, loser, wOldelo, lOldElo;
        
        if(!this.white || !this.black) {
            return;
        }
        
        //get the loser and the winner
        if(this.white.alive == true) {
            winner = this.white;
            loser = this.black;
        } else {
            winner = this.black;
            loser = this.white;
        }
        
        let room = this.connection.getRoomByName(this.roomName);
        
        if(winner.type == 'computer' || loser.type == 'computer') {
             //console.log("no ratings! Computer in game");
        } else {
            let timeType = getTimeTypeForTimeControl(this.time);
            
            if(!timeType) {
                console.log("no timeType");
                return;
            }
            
            let elo = new Elo();
            
            let winnerElo = winner[this.ratings_type][timeType];
            let loserElo = loser[this.ratings_type][timeType];

            let newWinnerElo = elo.ifWins(winnerElo, loserElo);
            let newLoserElo = elo.ifLoses(loserElo, winnerElo);
            
            if(draw) {
                newWinnerElo = elo.ifTies(winnerElo, loserElo);
                newLoserElo = elo.ifTies(loserElo, winnerElo);
            }
            
            winner[this.ratings_type][timeType] = newWinnerElo;
            loser[this.ratings_type][timeType] = newLoserElo;
            
            this.connection.updatePlayer(winner);
            this.connection.updatePlayer(loser);
            
            let data;
            
            if(winner.playerId === this.white.playerId) {
                let result = (draw) ? "1/2-1/2" : "1-0";
                data = {
                    white: {
                        "user_id": this.white.playerId, 
                        "elo": winnerElo
                        
                    },
                    black: {
                        "user_id": this.black.playerId,
                        "elo": loserElo
                    },
                    pgn: this.gameRulesObj.pgn(),
                    final_fen: this.gameRulesObj.fen(),
                    time: this.time,
                    result: result
                }
                
                
            } else {
                let result = (draw) ? "1/2-1/2" : "0-1";
                data = {
                    white: {
                        "user_id": this.white.playerId, 
                        "elo": loserElo
                        
                    },
                    black: {
                        "user_id": this.black.playerId,
                        "elo": winnerElo
                    },
                    pgn: this.gameRulesObj.pgn(),
                    final_fen: this.gameRulesObj.fen(),
                    time: this.time,
                    result: result
                }
            }
            
            if (this.startPos) {
                data.initial_fen = this.startPos;
            }
            
            var gameObjDB = new this.gameClassDB(data);
            gameObjDB.save().then((game) => {
                console.log('saved game ', game);
            }).catch(e => console.log(e));
            
            //send new ratings to each individual player
            setTimeout( function() {
                try {
                    
                    //save winner
                    User.findById({_id: winner.playerId})
                    .then( function (user) {
                        user[this.ratings_type][timeType] = newWinnerElo;
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
                            winner.socket.emit('update-user', updatedUser);
                        }.bind(this));
                    }.bind(this)).catch(e => console.log(e));
                    
                    //save loser
                    User.findById({_id: loser.playerId})
                    .then( function (user) {
                        user[this.ratings_type][timeType] = newLoserElo;
                        user.save( function(err, updatedUser) {
                            if(err) {
                                return;
                            }
                            let eloNotif = {
                                title: `${loser.username}'s elo is now ${newLoserElo} ${newLoserElo - loserElo}`,
                                position: 'tr',
                                autoDismiss: 6,
                            };
                            
                            loser.socket.emit('action', Notifications.success(eloNotif));
                            loser.socket.emit('update-user', updatedUser);
                        }.bind(this));
                    }.bind(this)).catch(e => console.log(e));
                
                } catch (e) {console.log(e)};
                
            }.bind(this), 1000);
        } 
        
        if(draw) {
            let drawNotif = {
                title: 'Game Over',
                message: 'The game has ended in a draw!',
                position: 'tr',
                autoDismiss: 5
            }
            
            this.io.to(this.roomName).emit('action', Notifications.warning(drawNotif));
            if (room)
                room.addMessage(new DrawMessage(null, null, this.roomName));
        } else {
            let endNotif = {
                title: 'Game Over',
                message: `The game is over, ${winner.username} has won!`,
                position: 'tr',
                autoDismiss: 5
            }
            
            this.io.to(this.roomName).emit('action', Notifications.info(endNotif));
            if (room)
                room.addMessage(new WinnerMessage(winner, null, this.roomName));
        }
        
        this.gameStarted = false;

        //wait 3 seconds before resetting the room
        setTimeout(function() {
            this.removePlayer('w');
            this.removePlayer('b');
            
            if(!room) {
                return;
            }
            
            this.io.to(this.roomName).emit('update-room', room.getRoom());
        }.bind(this), 3000);
        
        return true;
    }
    
}

export default Game;