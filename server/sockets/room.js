const {mapObject} = require('../utils/utils');
const {FourChess} = require('../../common/fourchess');
const {Chess} = require('chess.js');
const {User} = require('../models/user');
const Notifications = require('react-notification-system-redux');
const {clients, rooms, roomExists, getRoomByName, formatTurn} = require('./data');
const {getTimeTypeForTimeControl, getEloForTimeControl} = require('./data');
const {findRoomIndexByName, deleteUserFromBoardSeats} = require('./data');
const {deleteRoomByName, getAllRoomMembers} = require('./data');
const {userSittingAndGameOngoing} = require('./data');

//Synchronize clocks every half second
function initTimerSync(io, roomName, index) {
    let synchronizer = setInterval(() =>{
        if(!rooms[index]) {
            clearInterval(synchronizer);
            return;
        }

        if(!rooms[index][roomName]) {
            clearInterval(synchronizer);
            return;
        }

        if(!rooms[index][roomName].game) {
            clearInterval(synchronizer);
            return;
        }
        let turn = rooms[index][roomName].game.turn();
        let lastMove = rooms[index][roomName].lastMove
        turn = formatTurn(turn);
        let timeElapsed = Date.now() - lastMove;
        let timeLeft = rooms[index][roomName][turn].time;
        let time = timeLeft - timeElapsed;
        if(time <= 200) { //200ms is the cutoff time

            let loser, winner;
            if(rooms[index][roomName].gameType == 'four-player') {
                rooms[index][roomName].lastMove = Date.now();
                loser = rooms[index][roomName][turn];
                //Notify all players that a player has lost on time
                notificationOpts = {
                    title: `${loser.username} has lost on time!`,
                    position: 'tr',
                    autoDismiss: 5,
                };
                io.to(roomName).emit('action', Notifications.info(notificationOpts));
                rooms[index][roomName].game.nextTurn();
                if(turn == 'white') {
                    rooms[index][roomName].game.setWhiteOut();
                }
                else if(turn == 'black') {
                    rooms[index][roomName].game.setBlackOut();
                }
                else if(turn == 'gold') {
                    rooms[index][roomName].game.setGoldOut();
                }
                else if(turn == 'red') {
                    rooms[index][roomName].game.setRedOut();
                }

                if(rooms[index][roomName].game.game_over()) {
                    //game over
                    color = rooms[index][roomName].game.getWinnerColor();
                    rooms[index][roomName].game.set_turn(color);

                    endFourPlayerGame(io, roomName, index);
                } else {
                    currentTurn = formatTurn(rooms[index][roomName].game.turn());
                    io.to(roomName).emit('action', {
                        type: 'four-new-move',
                        payload: {
                            thread: roomName,
                            fen: rooms[index][roomName].game.fen(),
                            lastTurn: turn,
                            time: rooms[index][roomName][currentTurn].time
                        }
                    });
                }
            } else if(rooms[index][roomName].gameType == 'two-player'){
                time = 1;
                if(turn === 'white') {
                    winner = rooms[index][roomName].black;
                    loser = rooms[index][roomName].white;
                } else if(turn === 'black'){
                    winner = rooms[index][roomName].white;
                    loser = rooms[index][roomName].black;
                }

                //Notify all players that the game has ended
                notificationOpts = {
                    title: 'Game Over',
                    message: `${winner.username} has defeated ${loser.username}`,
                    position: 'tr',
                    autoDismiss: 5,
                };

                io.to(roomName).emit('action', Notifications.info(notificationOpts));

                //get elos and calculate new elos
                timeType = getTimeTypeForTimeControl(rooms[index][roomName]);

                wOldElo = getEloForTimeControl(rooms[index][roomName], winner);
                lOldElo = getEloForTimeControl(rooms[index][roomName], loser);

                endGame(io, timeType, wOldElo, lOldElo, winner, loser, index, roomName, false);
            }

        }
        //synchronize everyone's times
        io.to(roomName).emit('action', {
            type: 'timer-sync',
            payload: {
                thread: roomName,
                turn: turn,
                timeLeft: time
            }
        });
    }, 500);
}

function room(io, socket, action) {

    let roomName;
    switch (action.type) {

        //client is sending new message
        case 'server/new-message':
            io.to(action.payload.thread).emit('action', {
                type: 'receive-message',
                payload: action.payload
            });
            break;

        case 'server/join-room':
            //TODO limit the number of rooms that a user can create
            roomName = [Object.keys(action.payload)[0]];

            //Deep copy the Chat object
            roomObj = JSON.parse(JSON.stringify(action.payload[roomName]));

            roomName = roomObj.room.name;

            if (!roomExists(roomName)) {
                rooms.push(action.payload);
                io.emit('action', {
                    type: 'all-rooms',
                    payload: rooms
                });
            }

            //connect this user to this react-notification-system-redux
            socket.join(roomName);
            clients[socket.id].rooms.push(roomName);

            //Find the existing chat room
            roomObj = getRoomByName(roomName);

            if (roomObj.game) {
                roomObj.fen = roomObj.game.fen();
            }

            //get the list of all room members
            roomObj.users = getAllRoomMembers(io, roomName);
            //add a list of messages for client side purposes
            //TODO display last 10 messages
            roomObj.messages = [];

            //Tell the current user that they have joined the room
            socket.emit('action', {
                type: 'joined-room',
                payload: roomObj
            });

            //Tell everyone in the room that a new user has connnected
            io.to(roomName).emit('action', {
                type: 'user-room-joined',
                payload: roomObj
            });

            //Update the information about that room
            io.emit('action', {
                type: 'all-rooms',
                payload: rooms
            });
            break;

        case 'server/get-rooms':
            io.emit('action', {
                type: 'all-rooms',
                payload: rooms
            });
            break;

            //client is leaving a game room
        case 'server/leave-room':
            roomName = action.payload;
            userObj = clients[socket.id];
            roomIndex = findRoomIndexByName(roomName);

            clients[socket.id].rooms = clients[socket.id].rooms.map((room) => {
                if (room !== roomName) {
                    return room;
                }
            });

            socket.leave(roomName);

            socket.emit('action', {
                type: 'left-room',
                payload: roomName
            });

            //Tell everyone in the room that a user has disconnnected
            io.to(roomName).emit('action', {
                type: 'user-room-left',
                payload: {
                    name: roomName,
                    user: userObj
                }
            });

            if (io.sockets.adapter.rooms[roomName]) { //there are still users in the room

                rooms[roomIndex][roomName].users = getAllRoomMembers(io, roomName);
                if (!userSittingAndGameOngoing(userObj, rooms[roomIndex][roomName])) {
                    deleteUserFromBoardSeats(io, roomIndex, roomName, userObj.user._id);
                }

            } else { //this was the final user
                deleteRoomByName(roomName);
            }

            //Update the user count for that room
            io.emit('action', {
                type: 'all-rooms',
                payload: rooms
            });
            break;

            //User is requesting to play as a certain color
        case 'server/sit-down-board':
            roomName = action.payload.roomName;
            userObj = action.payload.profile;
            color = action.payload.color;
            if (roomName && userObj && color) {
                delete userObj.email; //delete sensitive info
                index = findRoomIndexByName(roomName);
                roomObj = rooms[index];
                deleteUserFromBoardSeats(io, index, roomName, userObj._id);
                if (roomObj) {
                    switch (color) {
                        case 'w':
                            if (!roomObj.white) {
                                userObj.color = color;

                                //initialize the players time (ms)
                                userObj.time =
                                    rooms[index][roomName].time.value * 60 * 1000;

                                rooms[index][roomName].white = userObj;

                                //tell everyone in the room
                                io.to(roomName).emit('action', {
                                    type: 'sit-down-white',
                                    payload: {
                                        thread: roomName,
                                        room: rooms[index][roomName].white
                                    }
                                });
                            }
                            break;
                        case 'b':
                            if (!roomObj.black) {
                                userObj.color = color;

                                //initialize the players time (ms)
                                userObj.time =
                                    rooms[index][roomName].time.value * 60 * 1000;

                                rooms[index][roomName].black = userObj;

                                //tell everyone in the room
                                io.to(roomName).emit('action', {
                                    type: 'sit-down-black',
                                    payload: {
                                        thread: roomName,
                                        room: rooms[index][roomName].black
                                    }
                                });
                            }
                            break;
                        case 'g':
                            if (!roomObj.gold) {
                                userObj.color = color;

                                //initialize the players time (ms)
                                userObj.time =
                                    rooms[index][roomName].time.value * 60 * 1000;

                                rooms[index][roomName].gold = userObj;
                                //tell everyone in the room
                                io.to(roomName).emit('action', {
                                    type: 'sit-down-gold',
                                    payload: {
                                        thread: roomName,
                                        room: rooms[index][roomName].gold
                                    }
                                });
                            }
                            break;
                        case 'r':

                            if (!roomObj.red) {
                                userObj.color = color;

                                //initialize the players time (ms)
                                userObj.time =
                                    rooms[index][roomName].time.value * 60 * 1000;

                                rooms[index][roomName].red = userObj;

                                //tell everyone in the room
                                io.to(roomName).emit('action', {
                                    type: 'sit-down-red',
                                    payload: {
                                        thread: roomName,
                                        room: rooms[index][roomName].red
                                    }
                                });
                            }
                            break;
                        default:
                            console.log("NOT a valid color");
                    }
                }

                if (rooms[index][roomName].gameType === "two-player") {
                    //Check to see if the game is ready to start
                    if (rooms[index][roomName].white && rooms[index][roomName].black) {

                        //Notify all players that the game is ready to be played
                        const notificationOpts = {
                            title: 'The game has begun',
                            message: '',
                            position: 'tr',
                            autoDismiss: 3,
                        };

                        io.to(roomName).emit('action', Notifications.warning(notificationOpts));
                        rooms[index][roomName].lastMove = Date.now();
                        rooms[index][roomName].turn = 'white';
                        rooms[index][roomName].game = new Chess();

                        io.to(roomName).emit('action', {
                            type: 'game-started',
                            payload: {
                                thread: roomName,
                                fen: rooms[index][roomName].game.fen(),
                                pgn: rooms[index][roomName].game.pgn()
                            }
                        })

                        //start first players timer
                        initTimerSync(io, roomName, index);
                    }
                } else if (rooms[index][roomName].gameType === "four-player") {
                    //Check to see if the game is ready to start
                    if (rooms[index][roomName].white && rooms[index][roomName].black &&
                        rooms[index][roomName].gold && rooms[index][roomName].red) {

                        //Notify all players that the game is ready to be played
                        const notificationOpts = {
                            title: 'The game has begun',
                            message: '',
                            position: 'tr',
                            autoDismiss: 3,
                        };

                        io.to(roomName).emit('action', Notifications.warning(notificationOpts));
                        rooms[index][roomName].lastMove = Date.now();
                        rooms[index][roomName].turn = 'white';
                        rooms[index][roomName].game = new FourChess();

                        io.to(roomName).emit('action', {
                            type: 'four-game-started',
                            payload: {
                                thread: roomName,
                                fen: rooms[index][roomName].game.fen(),
                                pgn: rooms[index][roomName].game.pgn()
                            }
                        })

                        //start first players timer
                        initTimerSync(io, roomName, index);

                        //initialize state on both server and client
                    }
                }
            }
            break;
    }

};

module.exports.room = room;
