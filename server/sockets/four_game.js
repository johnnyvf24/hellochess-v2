var spawn = require('child_process').spawn;

const Elo = require('elo-js');
const {FourChess} = require('../../common/fourchess');
const {mapObject, ab2str} = require('../utils/utils');
const {User} = require('../models/user');
const Notifications = require('react-notification-system-redux');
const {clients, rooms, roomExists, getRoomByName, formatTurn} = require('./data');
const {getTimeTypeForTimeControl, getEloForTimeControl} = require('./data');
const {findRoomIndexByName, deleteUserFromBoardSeats} = require('./data');
const {deleteRoomByName, fourComputers} = require('./data');
const {userSittingAndGameOngoing} = require('./data');
const {endFourPlayerGame, startTimerCountDown} = require('./board_reset');

function fourGame(io, socket, action) {
    let turn, currentTurn;
    let color, roomName, loser, roomIndex, winner, index, move, loserColor;
    let newTurnFormatted, newTurn, numOut;
    switch (action.type) {

        case 'server/four-resign':
            roomName = action.payload.roomName;
            loser = clients[socket.id].user;
            roomIndex = findRoomIndexByName(roomName);

            //Notify all players that a player has resigned
            notificationOpts = {
                title: `${loser.username} has resigned!`,
                position: 'tr',
                autoDismiss: 5,
            };
            io.to(roomName).emit('action', Notifications.info(notificationOpts));

            if (rooms[roomIndex][roomName].white._id == loser._id) {
                rooms[roomIndex][roomName].game.setWhiteOut();
                rooms[roomIndex][roomName].white.alive = false;
                loserColor = 'w';
                if (rooms[roomIndex][roomName].game.turn() == 'w') {
                    rooms[roomIndex][roomName].game.nextTurn();
                }
            } else if (rooms[roomIndex][roomName].black._id == loser._id) {
                rooms[roomIndex][roomName].game.setBlackOut();
                rooms[roomIndex][roomName].black.alive = false;
                loserColor = 'b';
                if (rooms[roomIndex][roomName].game.turn() == 'b') {
                    rooms[roomIndex][roomName].game.nextTurn();
                }
            } else if (rooms[roomIndex][roomName].gold._id == loser._id) {
                rooms[roomIndex][roomName].game.setGoldOut();
                rooms[roomIndex][roomName].gold.alive = false;
                loserColor = 'g';
                if (rooms[roomIndex][roomName].game.turn() == 'g') {
                    rooms[roomIndex][roomName].game.nextTurn();
                }
            } else if (rooms[roomIndex][roomName].red._id == loser._id) {
                rooms[roomIndex][roomName].game.setRedOut();
                rooms[roomIndex][roomName].red.alive = false;
                loserColor = 'r';
                if (rooms[roomIndex][roomName].game.turn() == 'r') {
                    rooms[roomIndex][roomName].game.nextTurn();
                }
            }

            if (rooms[roomIndex][roomName].game.game_over()) {
                //game over
                color = rooms[roomIndex][roomName].game.getWinnerColor();
                rooms[roomIndex][roomName].game.set_turn(color);

                endFourPlayerGame(io, roomName, roomIndex);
            } else {
                currentTurn = formatTurn(rooms[roomIndex][roomName].game.turn());

                //calculate the time difference
                let timeElapsed = Date.now() - rooms[roomIndex][roomName].lastMove;
                rooms[roomIndex][roomName].lastMove = Date.now();
                startTimerCountDown(io, roomName, roomIndex);

                io.to(roomName).emit('action', {
                    type: 'four-new-move',
                    payload: {
                        thread: roomName,
                        fen: rooms[roomIndex][roomName].game.fen(),
                        turn: rooms[roomIndex][roomName].game.turn(),
                        lastTurn: turn,
                        lastMove: rooms[roomIndex][roomName].lastMove,
                        time: rooms[roomIndex][roomName][currentTurn].time,
                    }
                });

                io.to(roomName).emit('action', {
                    type: 'four-resign',
                    payload: {
                        thread: roomName,
                        color: loserColor
                    }
                });

                //Update the information about that room
                io.emit('action', {
                    type: 'all-rooms',
                    payload: rooms
                });

                if(rooms[roomIndex][roomName][currentTurn].type == "computer") {
                    fourComputers[roomName].stdin.write("position fen " + rooms[roomIndex][roomName].game.fen().split('-')[0] + "\n");

                    //tell the computer whose turn it is
                    switch(newTurn) {
                        case 'w':
                            fourComputers[roomName].stdin.write("turn 0\n");
                            break;
                        case 'b':
                            fourComputers[roomName].stdin.write("turn 1\n");
                            break;
                        case 'g':
                            fourComputers[roomName].stdin.write("turn 2\n");
                            break;
                        case 'r':
                            fourComputers[roomName].stdin.write("turn 3\n");
                            break;
                    }

                    numOut = 0;

                    if(rooms[roomIndex][roomName].game.isWhiteOut()) {
            			fourComputers[roomName].stdin.write("out 0\n");
            			numOut++;
            		}
            		if(rooms[roomIndex][roomName].game.isBlackOut()) {
            			fourComputers[roomName].stdin.write("out 1\n");
            			numOut++;
            		}
            		if(rooms[roomIndex][roomName].game.isGoldOut()) {
            			fourComputers[roomName].stdin.write("out 2\n");
            			numOut++;
            		}
            		if(rooms[roomIndex][roomName].game.isRedOut()) {
            			fourComputers[roomName].stdin.write("out 3\n");
            			numOut++;
            		}

            		if( numOut == 1 &&
                        rooms[roomIndex][roomName][currentTurn].time > 120000) {
            		    fourComputers[roomName].stdin.write("go depth 6\n");
            		} else if(numOut == 2 &&
                             rooms[roomIndex][roomName][currentTurn].time > 120000)
                    {
            		    fourComputers[roomName].stdin.write("go depth 6\n");
            		} else {
            		    fourComputers[roomName].stdin.write("go depth 4\n");
            		}

                }
            }
            break;

        case 'server/four-new-move':
            roomName = action.payload.thread;
            move = action.payload.move;
            let lastMove = action.payload.move;
            index = findRoomIndexByName(roomName);
            let outColor;

            //get who's turn it is
            if(!rooms[index]) {
                return;
            }
            turn = rooms[index][roomName].game.turn()
            turn = formatTurn(turn);

            //make the move
            move = rooms[index][roomName].game.move(move);
            // store the move on the server
            rooms[index][roomName].move = lastMove;
            rooms[index][roomName].turn = rooms[index][roomName].game.turn();

            if (move === null) {
                //handle cheating scenario
            } else {
                if (move.color) {
                    let loser = formatTurn(move.color);
                    outColor = loser;
                    let lostPlayer = rooms[index][roomName][loser].username;
                    rooms[index][roomName][loser].alive = false;
                    const notificationOpts = {
                        title: 'Player Elimination',
                        message: `${lostPlayer} (${loser}) has been eliminated!`,
                        position: 'tr',
                        autoDismiss: 5,
                    };

                    io.to(roomName).emit('action', Notifications.info(notificationOpts));

                }
                let currentTurn;
                if (rooms[index][roomName].game.inCheckMate()) {
                    currentTurn = formatTurn(rooms[index][roomName].game.turn());
                    currentPlayer = rooms[index][roomName][currentTurn].username;
                    const notificationOpts = {
                        title: 'Checkmate',
                        message: `${currentTurn} is in checkmate! ${currentPlayer}'s turn has been skipped.`,
                        position: 'tr',
                        autoDismiss: 5,
                    };

                    io.to(roomName).emit('action', Notifications.warning(notificationOpts));
                    rooms[index][roomName].game.nextTurn(); //move to next player
                }
                //calculate the time difference
                let timeElapsed = Date.now() - rooms[index][roomName].lastMove;
                rooms[index][roomName].lastMove = Date.now();
                rooms[index][roomName][turn].time = rooms[index][roomName][turn].time - timeElapsed;
                //Add the time increment
                rooms[index][roomName][turn].time += rooms[index][roomName].time.increment * 1000;
                startTimerCountDown(io, roomName, index);

                io.to(roomName).emit('action', {
                    type: 'four-new-move',
                    payload: {
                        thread: roomName,
                        fen: rooms[index][roomName].game.fen(),
                        lastTurn: turn,
                        turn: rooms[index][roomName].game.turn(),
                        time: rooms[index][roomName][turn].time,
                        move: lastMove,
                        outColor: outColor
                    }
                });

                //check to see if the game is over
                if (rooms[index][roomName].game.game_over()) {

                    if (rooms[index][roomName].game.in_draw()) {

                    } else {
                        return endFourPlayerGame(io, roomName, index);
                    }
                }

                newTurn = rooms[index][roomName].game.turn();
                newTurnFormatted = formatTurn(newTurn);

                if(rooms[index][roomName][newTurnFormatted].type == "computer") {
                    //console.log(rooms[index][roomName].game.fen().split('-')[0]);
                    console.log("computer moving:", newTurn);
                    fourComputers[roomName].stdin.write("position fen " + rooms[index][roomName].game.fen().split('-')[0] + "\n");

                    //tell the computer whose turn it is
                    switch(newTurn) {
                        case 'w':
                            fourComputers[roomName].stdin.write("turn 0\n");
                            break;
                        case 'b':
                            fourComputers[roomName].stdin.write("turn 1\n");
                            break;
                        case 'g':
                            fourComputers[roomName].stdin.write("turn 2\n");
                            break;
                        case 'r':
                            fourComputers[roomName].stdin.write("turn 3\n");
                            break;
                    }
                    numOut = 0;

                    if(rooms[index][roomName].game.isWhiteOut()) {
            			fourComputers[roomName].stdin.write("out 0\n");
            			numOut++;
            		}
            		if(rooms[index][roomName].game.isBlackOut()) {
            			fourComputers[roomName].stdin.write("out 1\n");
            			numOut++;
            		}
            		if(rooms[index][roomName].game.isGoldOut()) {
            			fourComputers[roomName].stdin.write("out 2\n");
            			numOut++;
            		}
            		if(rooms[index][roomName].game.isRedOut()) {
            			fourComputers[roomName].stdin.write("out 3\n");
            			numOut++;
            		}

                    if( numOut == 1 &&
                        rooms[index][roomName][newTurnFormatted].time > 120000) {
            		    fourComputers[roomName].stdin.write("go depth 6\n");
            		} else if(numOut == 2 &&
                         rooms[index][roomName][newTurnFormatted].time > 120000)
                    {
            		    fourComputers[roomName].stdin.write("go depth 6\n");
            		} else {
            		    fourComputers[roomName].stdin.write("go depth 4\n");
            		}
                }
            }

            break;
    }
}

module.exports.fourGame = fourGame;
