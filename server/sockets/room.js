const {mapObject, ab2str} = require('../utils/utils');
const {FourChess} = require('../../common/fourchess');
const {Chess} = require('chess.js');
const {User} = require('../models/user');
const Notifications = require('react-notification-system-redux');
const {clients, rooms, roomExists, getRoomByName, formatTurn} = require('./data');
const {getTimeTypeForTimeControl, getEloForTimeControl} = require('./data');
const {findRoomIndexByName, deleteUserFromBoardSeats} = require('./data');
const {deleteRoomByName, getAllRoomMembers} = require('./data');
const {addMessageToRoom, getRecentMessages} = require('./data');
const {userSittingAndGameOngoing, fourComputers, twoComputers} = require('./data');
const {newRoomId} = require('./data');
const {startTimerCountDown} = require('./board_reset');
const TwoEngine = require('../../engine/TwoEngine');
const FourEngine = require('../../engine/FourEngine');

function room(io, socket, action) {

    let roomName, turn, roomIndex, roomObj, userObj, msgObj, aiObj;
    switch (action.type) {

        //client is sending new message
        case 'server/new-message':
            addMessageToRoom(action.payload.thread, action.payload);
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
                // add an id to the room
                let new_id = newRoomId();
                action.payload[roomName].id = new_id;
                roomObj.id = new_id;
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
            roomObj.messages = getRecentMessages(roomName);

            //Tell the current user that they have joined the room
            socket.emit('action', {
                type: 'joined-room',
                payload: roomObj
            });

            let joined_user = roomObj.users[roomObj.users.length-1].username;
            let joined_msg = joined_user + " has joined the room.";
            let msgObj = {
                user: joined_user,
                msg: joined_msg,
                thread: roomName,
                picture: null,
                event_type: 'user-joined'
            };

            //Tell everyone in the room that a new user has connnected
            io.to(roomName).emit('action', {
                type: 'user-room-joined',
                payload: roomObj,
                message: msgObj
            });

            addMessageToRoom(roomName, msgObj);

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

        case 'server/selected-room':
            roomName = action.payload;  //the room that info is being requested about
            roomIndex = findRoomIndexByName(roomName);
            if(rooms[roomIndex] && rooms[roomIndex][roomName]) {
                if(rooms[roomIndex][roomName].game) {
                    //get whos turn it is
                    turn = rooms[roomIndex][roomName].game.turn();
                    turn = formatTurn(turn);

                    //calculate the time difference between the last move
                    let timeElapsed = Date.now() - rooms[roomIndex][roomName].lastMove;

                    //synchronize everyone's times at the end
                    socket.emit('action', {
                        type: 'timer-sync',
                        payload: {
                            thread: roomName,
                            turn: turn,
                            timeLeft: rooms[roomIndex][roomName][turn].time - timeElapsed,
                            fen: rooms[roomIndex][roomName].game.fen()
                        }
                    });
                }
            }

            socket.emit('action', {
                type: 'SELECTED_ROOM',
                payload: roomName
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


            let left_msg = userObj.user.username + " has left the room.";
            let message_obj = {
                user: userObj.user.username,
                msg: left_msg,
                thread: roomName,
                picture: null,
                event_type: 'user-left'
            };

            //Tell everyone in the room that a user has disconnnected
            io.to(roomName).emit('action', {
                type: 'user-room-left',
                payload: {
                    name: roomName,
                    user: userObj,
                    message: message_obj
                }
            });

            addMessageToRoom(roomName, message_obj);

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

        case 'server/remove-ai-player':
            roomName = action.payload.thread,
            aiObj = action.payload.player;
            index = findRoomIndexByName(roomName);
            if(rooms[index][roomName]) {
                switch(aiObj.color) {
                    case 'w':
                        delete rooms[index][roomName].white;
                        io.to(roomName).emit('action', {
                            type: 'up-white',
                            payload: {
                                name: roomName
                            }
                        });
                        break;
                    case 'b':
                        delete rooms[index][roomName].black;
                        io.to(roomName).emit('action', {
                            type: 'up-black',
                            payload: {
                                name: roomName
                            }
                        });
                        break;
                    case 'g':
                        delete rooms[index][roomName].gold;
                        io.to(roomName).emit('action', {
                            type: 'up-gold',
                            payload: {
                                name: roomName
                            }
                        });
                        break;
                    case 'r':
                        delete rooms[index][roomName].red;
                        io.to(roomName).emit('action', {
                            type: 'up-red',
                            payload: {
                                name: roomName
                            }
                        });
                        break;
                }
            }
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
                if(!userObj.type) {
                    deleteUserFromBoardSeats(io, index, roomName, userObj._id);
                }

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
                                pgn: rooms[index][roomName].game.pgn(),
                                lastMove: rooms[index][roomName].lastmove
                            }
                        })
                        //First player to move is the AI
                        if(rooms[index][roomName].white.type == "computer"
                           || rooms[index][roomName].black.type == "computer") {
                            twoComputers[roomName] =
                                new TwoEngine("./engine/bin/stockfish_8_x64", roomName, socket);
                           }

                        //start first players timer
                        startTimerCountDown(io, roomName, index);
                        
                        if(rooms[index][roomName].white.type == "computer") {
                            twoComputers[roomName].setPosition(rooms[index][roomName].game.fen());


                            //search for a move
                            twoComputers[roomName].go();
                        }
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
                                pgn: rooms[index][roomName].game.pgn(),
                                lastMove: rooms[index][roomName].lastmove
                            }
                        });
                                
                        fourComputers[roomName] =
                                new FourEngine("./engine/bin/fourengine", roomName, socket);
                        

                        //First player to move is the AI
                        if(rooms[index][roomName].white.type == "computer"
                           || rooms[index][roomName].black.type == "computer"
                           || rooms[index][roomName].gold.type == "computer"
                           || rooms[index][roomName].red.type == "computer") {
                            
                            fourComputers[roomName].setMode(0);
                            //start first players timer
                            startTimerCountDown(io, roomName, index);

                            if(rooms[index][roomName].white.type == "computer") {
                                fourComputers[roomName].setPosition(rooms[index][roomName].game.fen());

                                //tell the computer it's white's turn
                                fourComputers[roomName].setTurn('w');

                                //search for a move
                                fourComputers[roomName].go();
                            }

                        } else {
                            fourComputers[roomName].setMode(1);
                        }
                    }
                }
            }
            break;
    }

};

module.exports.room = room;
