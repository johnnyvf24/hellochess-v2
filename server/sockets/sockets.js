const Notifications = require('react-notification-system-redux');
const {mapObject} = require('../utils/utils');
const Elo = require('elo-js');
const {User} = require('../models/user');
const {connection} = require('./connection');
const {twoGame} = require('./two_game');
const {fourGame} = require('./four_game');
const {room} = require('./room');
const {clients, rooms, deleteRoomByName, findRoomIndexByName} = require('./data');
const {getAllRoomMembers, userSittingAndGameOngoing} = require('./data');
const {deleteUserFromBoardSeats} = require('./data');

module.exports.socketServer = function(io) {

    io.on('connection', (socket) => {
        socket.on('action', (action) => {
            let roomName, roomObj, userObj, roomIndex, color, index, turn;
            let loser, winner, timeType, wOldElo, lOldElo, userObj2;
            let notificationOpts;
            connection(io, socket, action);
            room(io, socket, action);
            twoGame(io, socket, action);
            fourGame(io, socket, action);
        });

        socket.on('disconnect', function() {
            if(clients[socket.id]) {
                //Get all the rooms that user is connected to and the user info
                const userObj = clients[socket.id]
                const joinedRooms = userObj.rooms;
                // console.log(rooms)
                mapObject(joinedRooms, (key, val) => {
                    let roomIndex;
                    //Check to see if users are still in the room
                    if(io.sockets.adapter.rooms[val]) {
                        //Tell everyone that a user left
                        io.to(val).emit('action', {
                            type: 'user-room-left',
                            payload: {
                                name: val,
                                user: userObj
                            }
                        });
                        //update this specific room
                        roomIndex = findRoomIndexByName(val);
                        rooms[roomIndex][val].users = getAllRoomMembers(io, val);
                        if(!userSittingAndGameOngoing(userObj, rooms[roomIndex][val])) {
                            deleteUserFromBoardSeats(io, roomIndex, val, userObj.user._id);
                        }

                    } else {
                        //there are no users in this room
                        if(val) {
                            deleteRoomByName(val);
                        }

                    }
                });
            }

            //Tell all clients about potential room(s) changes
            io.emit('action', {
                type: 'all-rooms',
                payload: rooms
            });
            delete clients[socket.id];
        });
    });
};
