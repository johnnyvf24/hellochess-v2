const Elo = require('elo-js');
const {mapObject} = require('../utils/utils');
const {User} = require('../models/user');
const Notifications = require('react-notification-system-redux');
const {clients, rooms, roomExists, getRoomByName, formatTurn} = require('./data');
const {getTimeTypeForTimeControl, getEloForTimeControl} = require('./data');
const {findRoomIndexByName, deleteUserFromBoardSeats} = require('./data');
const {deleteRoomByName} = require('./data');
const {userSittingAndGameOngoing} = require('./data');
const {endGame, startTimerCountDown} = require('./board_reset');

function twoGame(io, socket, action) {
    let roomName;
    switch (action.type) {

        //a user is sending a draw request
        case 'server/draw':
            roomName = action.payload.roomName;
            userObj = clients[socket.id].user;

            roomIndex = findRoomIndexByName(roomName);

            if (rooms[roomIndex][roomName].white._id === userObj._id) {
                userObj2 = rooms[roomIndex][roomName].black;
                userObj = rooms[roomIndex][roomName].white;
            } else {
                userObj2 = rooms[roomIndex][roomName].white;
                userObj = rooms[roomIndex][roomName].black;
            }

            User.findById(userObj2._id)
                .then((user) => {
                    io.to(user.socket_id).emit('draw-request', {
                        thread: roomName
                    });

                    let notif = {
                        title: 'Draw request sent!',
                        position: 'tr',
                        autoDismiss: 2,
                    };
                    io.to(socket.id).emit('action', Notifications.info(notif));
                }).catch((e) => {
                    console.log(e);
                });

            break;

        case 'server/accept-draw':
            roomName = action.payload.roomName;
            userObj = clients[socket.id].user;

            roomIndex = findRoomIndexByName(roomName);

            if (rooms[roomIndex][roomName].white._id === userObj._id) {
                userObj2 = rooms[roomIndex][roomName].black;
                userObj = rooms[roomIndex][roomName].white;
            } else {
                userObj2 = rooms[roomIndex][roomName].white;
                userObj = rooms[roomIndex][roomName].black;
            }

            //Notify all players that the game has ended in a draw
            notificationOpts = {
                title: 'Game Over',
                message: 'The game ended in a draw!',
                position: 'tr',
                autoDismiss: 5,
            };

            io.to(roomName).emit('action', Notifications.warning(notificationOpts));

            //get elos and calculate new elos
            timeType = getTimeTypeForTimeControl(rooms[roomIndex][roomName]);

            wOldElo = getEloForTimeControl(rooms[roomIndex][roomName], userObj);
            lOldElo = getEloForTimeControl(rooms[roomIndex][roomName], userObj2);

            endGame(io, timeType, wOldElo, lOldElo, userObj, userObj2, roomIndex, roomName, true);
            break;

            //a user is resigning
        case 'server/resign':
            roomName = action.payload.roomName;
            loser = clients[socket.id].user;
            if (loser._id != action.payload.playerId) {
                //TODO cheating?
            }
            roomIndex = findRoomIndexByName(roomName);

            if (rooms[roomIndex][roomName].white._id === loser._id) {
                winner = rooms[roomIndex][roomName].black;
                loser = rooms[roomIndex][roomName].white;
            } else {
                winner = rooms[roomIndex][roomName].white;
                loser = rooms[roomIndex][roomName].black;
            }

            //Notify all players that a player has resigned
            notificationOpts = {
                title: 'Game Over',
                message: `${loser.username} has resigned. ${winner.username} has won!`,
                position: 'tr',
                autoDismiss: 5,
            };

            io.to(roomName).emit('action', Notifications.info(notificationOpts));

            //get elos and calculate new elos
            timeType = getTimeTypeForTimeControl(rooms[roomIndex][roomName]);

            wOldElo = getEloForTimeControl(rooms[roomIndex][roomName], winner);
            lOldElo = getEloForTimeControl(rooms[roomIndex][roomName], loser);

            endGame(io, timeType, wOldElo, lOldElo, winner, loser, roomIndex, roomName, false);

            break;

        case 'server/new-move':
            roomName = action.payload.thread;
            move = action.payload.move;
            let cmove = action.payload.move;
            index = findRoomIndexByName(roomName);

            //get whose turn it is
            if(!rooms[index][roomName].game) {
                break;
            }
            turn = rooms[index][roomName].game.turn()
            turn = formatTurn(turn);

            //make the move
            move = rooms[index][roomName].game.move(move);
            if (move === null) {
                //handle cheating scenario
            } else {
                //calculate the time difference
                let timeElapsed = Date.now() - rooms[index][roomName].lastMove;
                rooms[index][roomName].lastMove = Date.now();
                rooms[index][roomName][turn].time = rooms[index][roomName][turn].time - timeElapsed;
                //Add the time increment
                rooms[index][roomName][turn].time += rooms[index][roomName].time.increment * 1000;

                startTimerCountDown(io, roomName, index);
                
                // store the move on the server
                rooms[index][roomName].move = move;

                io.to(roomName).emit('action', {
                    type: 'new-move',
                    payload: {
                        thread: roomName,
                        fen: rooms[index][roomName].game.fen(),
                        turn: rooms[index][roomName].game.turn(),
                        pgn: rooms[index][roomName].game.pgn(),
                        lastTurn: turn,
                        lastMove: rooms[index][roomName].lastMove,
                        move: cmove,
                        time: rooms[index][roomName][turn].time
                    }
                })
            }

            //check to see if the game is over
            if (rooms[index][roomName].game.game_over()) {

                //get the loser
                let nextTurn = rooms[index][roomName].game.turn();

                nextTurn = formatTurn(nextTurn);

                winner = rooms[index][roomName][turn].username;
                loser = rooms[index][roomName][nextTurn].username;

                if (rooms[index][roomName].game.in_draw()) {
                    //Notify all players that the game is ready to be played
                    const notificationOpts = {
                        title: 'Game Over',
                        message: `The game ended in a draw!`,
                        position: 'tr',
                        autoDismiss: 5,
                    };

                    io.to(roomName).emit('action', Notifications.warning(notificationOpts));

                    winner = rooms[index][roomName][turn];
                    loser = rooms[index][roomName][nextTurn];

                    timeType = getTimeTypeForTimeControl(rooms[index][roomName]);

                    wOldElo = getEloForTimeControl(rooms[index][roomName], winner);
                    lOldElo = getEloForTimeControl(rooms[index][roomName], loser);

                    endGame(io, timeType, wOldElo, lOldElo, winner, loser, index, roomName, true);
                } else {
                    //Notify all players that the game is ready to be played
                    const notificationOpts = {
                        title: 'Game Over',
                        message: `${winner} is the winner`,
                        position: 'tr',
                        autoDismiss: 5,
                    };

                    io.to(roomName).emit('action', Notifications.warning(notificationOpts));

                    winner = rooms[index][roomName][turn];
                    loser = rooms[index][roomName][nextTurn];

                    timeType = getTimeTypeForTimeControl(rooms[index][roomName]);

                    wOldElo = getEloForTimeControl(rooms[index][roomName], winner);
                    lOldElo = getEloForTimeControl(rooms[index][roomName], loser);

                    endGame(io, timeType, wOldElo, lOldElo, winner, loser, index, roomName, false);
                }
            }
            break;
    }

};

module.exports.twoGame = twoGame;
