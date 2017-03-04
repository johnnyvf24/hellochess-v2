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
const {endFourPlayerGame, startTimerCountDown} = require('./board_reset');

function fourGame(io, socket, action) {
    let turn, currentTurn;
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

            }
            break;

        case 'server/four-new-move':
            roomName = action.payload.thread;
            move = action.payload.move;
            let lastMove = action.payload.move;
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
                startTimerCountDown(io, roomName, index);

                io.to(roomName).emit('action', {
                    type: 'four-new-move',
                    payload: {
                        thread: roomName,
                        fen: rooms[index][roomName].game.fen(),
                        lastTurn: turn,
                        turn: rooms[index][roomName].game.turn(),
                        time: rooms[index][roomName][turn].time,
                        move: lastMove
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

module.exports.fourGame = fourGame;
