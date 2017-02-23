const Elo = require('elo-js');
const {FourChess} = require('../../common/fourchess');
const {mapObject} = require('../utils/utils');
const {User} = require('../models/user');
const Notifications = require('react-notification-system-redux');
const {clients, rooms, roomExists, getRoomByName, formatTurn} = require('./data');
const {getTimeTypeForTimeControl, getEloForTimeControl} = require('./data');
const {findRoomIndexByName, deleteUserFromBoardSeats} = require('./data');
const {deleteRoomByName} = require('./data');
const {userSittingAndGameOngoing} = require('./data');

function fourGame(io, socket, action) {
    let turn;
    let color, roomName, loser, roomIndex, winner, index, move, loserColor;
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
                loserColor = 'w';
                if (rooms[roomIndex][roomName].game.turn() == 'w') {
                    rooms[roomIndex][roomName].game.nextTurn();
                }
            } else if (rooms[roomIndex][roomName].black._id == loser._id) {
                rooms[roomIndex][roomName].game.setBlackOut();
                loserColor = 'b';
                if (rooms[roomIndex][roomName].game.turn() == 'b') {
                    rooms[roomIndex][roomName].game.nextTurn();
                }
            } else if (rooms[roomIndex][roomName].gold._id == loser._id) {
                rooms[roomIndex][roomName].game.setGoldOut();
                loserColor = 'g';
                if (rooms[roomIndex][roomName].game.turn() == 'g') {
                    rooms[roomIndex][roomName].game.nextTurn();
                }
            } else if (rooms[roomIndex][roomName].red._id == loser._id) {
                rooms[roomIndex][roomName].game.setRedOut();
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
                io.to(roomName).emit('action', {
                    type: 'four-resign',
                    payload: {
                        thread: roomName,
                        color: loserColor
                    }
                });
                currentTurn = formatTurn(rooms[roomIndex][roomName].game.turn());
                
                console.log('fen ', rooms[roomIndex][roomName].game.fen());
                
                io.to(roomName).emit('action', {
                    type: 'four-new-move',
                    payload: {
                        thread: roomName,
                        fen: rooms[roomIndex][roomName].game.fen(),
                        lastTurn: turn,
                        time: rooms[roomIndex][roomName][currentTurn].time
                    }
                });

                //Update the information about that room
                io.emit('action', {
                    type: 'all-rooms',
                    payload: rooms
                });

            }
            break;

        case 'server/four-new-move':
            roomName = action.payload.thread;
            move = action.payload.move;
            index = findRoomIndexByName(roomName);

            //get who's turn it is
            turn = rooms[index][roomName].game.turn()
            turn = formatTurn(turn);
            
            //make the move
            move = rooms[index][roomName].game.move(move);
            if (move === null) {
                //handle cheating scenario
            } else {
                if (move.color) {
                    let loser = formatTurn(move.color);
                    let lostPlayer = rooms[index][roomName][loser].username;
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

                io.to(roomName).emit('action', {
                    type: 'four-new-move',
                    payload: {
                        thread: roomName,
                        fen: rooms[index][roomName].game.fen(),
                        lastTurn: turn,
                        time: rooms[index][roomName][turn].time
                    }
                });
            }

            //check to see if the game is over
            if (rooms[index][roomName].game.game_over()) {

                if (rooms[index][roomName].game.in_draw()) {

                } else {
                    endFourPlayerGame(io, roomName, index);
                }
            }
            break;
    }
}

function endFourPlayerGame(io, roomName, index) {
    //pause the game
    io.to(roomName).emit('action', {
        type: 'pause',
        payload: {
            thread: roomName
        }
    });

    let elo = new Elo();

    let winnerColor = formatTurn(rooms[index][roomName].game.turn());
    let winner = rooms[index][roomName][winnerColor];

    let loserOrder = rooms[index][roomName].game.getLoserOrder();

    delete loserOrder[winnerColor];

    let firstOut, secondOut, thirdOut;
    mapObject(loserOrder, (key, player) => {
        if(player === 1) {
            firstOut = rooms[index][roomName][key];
        } else if(player === 2) {
            secondOut = rooms[index][roomName][key];
        } else if(player === 3) {
            thirdOut = rooms[index][roomName][key];
        }
    });

    let firstOutElo, secondOutElo, thirdOutElo, fourthOutElo;
    let timeType = getTimeTypeForTimeControl(rooms[index][roomName]);

    //get appropriate elos
    firstOutElo = getEloForTimeControl(rooms[index][roomName], firstOut);
    secondOutElo = getEloForTimeControl(rooms[index][roomName], secondOut);
    thirdOutElo = getEloForTimeControl(rooms[index][roomName], thirdOut);
    fourthOutElo = getEloForTimeControl(rooms[index][roomName], winner);

    //calculate average elo of the 3rd and 4th place
    let bottomAvgElo = (firstOutElo + secondOutElo) / 2;
    //calculate average elo of 1st and 2nd place
    let topAvgElo = (thirdOutElo + fourthOutElo) / 2;

    let wElo = elo.ifWins(topAvgElo, bottomAvgElo);
    let lElo = elo.ifLoses(bottomAvgElo, topAvgElo);

    let newFirstOutElo = Math.round((2 * (lElo-bottomAvgElo)) + firstOutElo);
    let newSecondOutElo = Math.round((lElo- bottomAvgElo) + secondOutElo);
    let newThirdOutElo = Math.round((wElo - topAvgElo) + thirdOutElo);
    let newWinnerElo = Math.round(((wElo - topAvgElo) * 2) + fourthOutElo);

    //console.log(`new ELos: winner: ${newWinnerElo} second: ${newThirdOutElo} third: ${newSecondOutElo} fourth: ${newFirstOutElo}`);

    //save the winner's elo
    User.findById({ _id: winner._id })
    .then((user) => {
        user.four_elos[timeType] = newWinnerElo;
        user.save(function(err, updatedUser) {
            let eloNotif = {
                title: `${winner.username}'s elo is now ${newWinnerElo} +${newWinnerElo - fourthOutElo}`,
                position: 'tr',
                autoDismiss: 6,
            };

            io.to(roomName).emit('action', Notifications.success(eloNotif));
            io.to(updatedUser.socket_id).emit('action', {
                type: 'user-update',
                payload: updatedUser
            });
        });
    }).catch((e) => {
        console.log(e);
    });

    setTimeout(() => {
        //Save 2nd place elo
        User.findById({ _id: thirdOut._id })
        .then((user) => {
            user.four_elos[timeType] = newThirdOutElo;
            user.save(function(err, updatedUser) {
                let eloNotif = {
                    title: `${thirdOut.username}'s elo is now ${newThirdOutElo} ${newThirdOutElo - thirdOutElo}`,
                    position: 'tr',
                    autoDismiss: 6,
                };

                io.to(roomName).emit('action', Notifications.success(eloNotif));

                delete updatedUser.tokens;
                io.to(updatedUser.socket_id).emit('action', {
                    type: 'user-update',
                    payload: updatedUser
                });
            });
        }).catch((e) => {
            console.log(e);
        });
    }, 250);

    setTimeout(() => {
        //Save 3rd place elo
        User.findById({ _id: secondOut._id })
        .then((user) => {
            user.four_elos[timeType] = newSecondOutElo;
            user.save(function(err, updatedUser) {
                let eloNotif = {
                    title: `${secondOut.username}'s elo is now ${newSecondOutElo} ${newSecondOutElo - secondOutElo}`,
                    position: 'tr',
                    autoDismiss: 6,
                };

                io.to(roomName).emit('action', Notifications.error(eloNotif));

                delete updatedUser.tokens;
                io.to(updatedUser.socket_id).emit('action', {
                    type: 'user-update',
                    payload: updatedUser
                });
            });
        }).catch((e) => {
            console.log(e);
        });
    }, 250);

    setTimeout(() => {
        //Save 4th place elo
        User.findById({ _id: firstOut._id })
        .then((user) => {
            user.four_elos[timeType] = newFirstOutElo;
            user.save(function(err, updatedUser) {
                let eloNotif = {
                    title: `${firstOut.username}'s elo is now ${newFirstOutElo} ${newFirstOutElo - firstOutElo}`,
                    position: 'tr',
                    autoDismiss: 6,
                };

                io.to(roomName).emit('action', Notifications.error(eloNotif));

                delete updatedUser.tokens;
                io.to(updatedUser.socket_id).emit('action', {
                    type: 'user-update',
                    payload: updatedUser
                });
            });
        }).catch((e) => {
            console.log(e);
        });
    }, 250);

    //Stop the clocks
    delete rooms[index][roomName].game;

    //kick players from board and restart game
    setTimeout(() => {
        delete rooms[index][roomName].white;
        delete rooms[index][roomName].black;
        delete rooms[index][roomName].gold;
        delete rooms[index][roomName].red;
        let boardNotif = {
            title: 'Board ready',
            position: 'tr',
            autoDismiss: 5,
        };
        io.to(roomName).emit('action', Notifications.warning(boardNotif));

        io.to(roomName).emit('action', {
            type: 'game-over',
            payload: roomName
        });

        //Update the information about that room
        io.emit('action', {
            type: 'all-rooms',
            payload: rooms
        });

        io.to(roomName).emit('action', {
            type: 'resume',
            payload: {
                thread: roomName
            }
        });
    }, 5000);
}


module.exports.fourGame = fourGame;
module.exports.endFourPlayerGame = endFourPlayerGame;
