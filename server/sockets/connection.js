const {mapObject} = require('../utils/utils');
const {User} = require('../models/user');
const Notifications = require('react-notification-system-redux');
const {clients, rooms, roomExists, getRoomByName, formatTurn} = require('./data');
const {getTimeTypeForTimeControl, getEloForTimeControl} = require('./data');
const {findRoomIndexByName, deleteUserFromBoardSeats} = require('./data');
const {addMessageToRoom} = require('./data');
const {deleteRoomByName} = require('./data');
const {userSittingAndGameOngoing, getAllRoomMembers} = require('./data');

function connection(io, socket, action){
    let roomName;
    switch(action.type) {
        //Client emiits message this after loading page
        case 'server/connected-user':

            //Determine if this use is only logged in once
            let foundDuplicate = false;
            mapObject(clients, (key, val) => {
                if(val.user._id === action.payload.user._id) {
                    //same user
                    foundDuplicate = true;
                }
            });
            if(foundDuplicate) {
                return socket.emit('action', {
                    type: 'duplicate-login'
                });
            } else {
                //set the clients obj with the user's info
                clients[socket.id] = action.payload;

                //maintain a list of all the rooms this user is in.
                clients[socket.id].rooms = [];
                socket.username = action.payload.user.username;

                socket.emit('action', {
                    type: 'connected'
                });

                //update the database, keep track of the socketid for that user
                User.findById({ _id: action.payload.user._id })
                .then((user) => {
                    user.socket_id = socket.id;
                    user.save(function(err, updatedUser) {
                        if(action.payload.user.username) {
                            let notif = {
                                title: `Welcome ${updatedUser.username}!`,
                                position: 'tc',
                                autoDismiss: 3,
                            };
                            io.to(socket.id).emit('action', Notifications.success(notif));
                        }
                    });
                }).catch((e) => {
                });

            }
            break;

        case 'server/update-user':
            clients[socket.id] = action.payload;
            clients[socket.id].rooms = [];
            socket.username = action.payload.user.username;
            break;

        case 'server/logout':
            if(clients[socket.id]) {
                //Get all the rooms that user is connected to and the user info
                const userObj = clients[socket.id];

                const joinedRooms = userObj.rooms;
                mapObject(joinedRooms, (key, val) => {
                    let roomName = val;
                    socket.leave(roomName);
                    
                    let left_msg = userObj.user.username + " has left the room.";
                    let message_obj = {
                        user: userObj.user.username,
                        msg: left_msg,
                        thread: roomName,
                        picture: null,
                        event_type: 'user-left'
                    };
                    //Tell everyone in that room that a user has disconnnected
                    io.to(roomName).emit('action', {
                        type: 'user-room-left',
                        payload: {
                            name: roomName,
                            user: userObj,
                            message: message_obj
                        }
                    });
                    addMessageToRoom(roomName, message_obj);

                    let roomIndex;
                    //Check to see if users are still in the room
                    if(io.sockets.adapter.rooms[roomName]) {

                        //update this specific room
                        roomIndex = findRoomIndexByName(roomName);

                        rooms[roomIndex][roomName].users = getAllRoomMembers(io, roomName);
                        if(!userSittingAndGameOngoing(userObj, rooms[roomIndex][roomName])) {
                            deleteUserFromBoardSeats(io, roomIndex, roomName, userObj.user._id);
                        }

                    } else {
                        //there are no users in this room
                        if(roomName) {
                            deleteRoomByName(roomName);
                        }
                    }
                })
            }

            delete clients[socket.id];
            //Tell all clients about potential room(s) changes
            io.emit('action', {
                type: 'all-rooms',
                payload: rooms
            });

            socket.emit('action', {type: 'LOGOUT_SUCCESS'});
        break;

    }

};

module.exports.connection = connection;
