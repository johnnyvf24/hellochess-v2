import Game from './Game';
const {Chess} = require('chess.js');
const {User} = require('../../models/user');
const {StandardGame} = require('../../models/standard');
const Elo = require('elo-js');
import Player from '../players/Player';
import TwoEngine from '../../engine/TwoEngine';
const Notifications = require('react-notification-system-redux');
import Connection from '../../sockets/Connection';
import Room from '../rooms/Room';


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
        this.gameRulesObj = new Chess();
        this.fenHistory = [];
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
        
        
        if(winner.type == 'computer' || loser.type == 'computer') {
             console.log("no ratings! Computer in game");
        } else {
            
            let timeType = getTimeTypeForTimeControl(this.time);
            
            if(!timeType) {
                console.log("no timeType");
                return;
            }
            
            let elo = new Elo();
            
            let winnerElo = winner.standard_ratings[timeType];
            let loserElo = loser.standard_ratings[timeType];

            let newWinnerElo = elo.ifWins(winnerElo, loserElo);
            let newLoserElo = elo.ifLoses(loserElo, winnerElo);
            
            if(draw) {
                newWinnerElo = elo.ifTies(winnerElo, loserElo);
                newLoserElo = elo.ifTies(loserElo, winnerElo);
            }
            
            winner.standard_ratings[timeType] = newWinnerElo;
            loser.standard_ratings[timeType] = newLoserElo;
            
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
            
            var standard_game = new StandardGame(data);
            standard_game.save().then((game) => {
                console.log('saved game ', game);
            }).catch(e => console.log(e));
            
            //send new ratings to each individual player
            setTimeout( function() {
                try {
                    
                    //save winner
                    User.findById({_id: winner.playerId})
                    .then( function (user) {
                        user.standard_ratings[timeType] = newWinnerElo;
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
                        user.standard_ratings[timeType] = newLoserElo;
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
        
        this.gameStarted = false;

        //wait 3 seconds before resetting the room
        setTimeout(function() {
            this.removePlayer('w');
            this.removePlayer('b');
            
            let room: Room = this.connection.getRoomByName(this.roomName);
            
            if(!room) {
                return;
            }
            
            this.io.to(this.roomName).emit('update-room', room.getRoom());
        }.bind(this), 3000);
        
        return true;
    }
}