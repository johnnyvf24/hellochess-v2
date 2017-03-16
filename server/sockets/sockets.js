const Notifications = require('react-notification-system-redux');
const {mapObject} = require('../utils/utils');
const Elo = require('elo-js');
const Connection = require('./Connection');
const Player = require('./players/Player');
const Room = require('./rooms/Room.js');

//Game Rules
const {FourChess} = require('../../common/fourchess');
const {Chess} = require('chess.js');

//master connection object
let conn = new Connection();

module.exports.socketServer = function(io) {

    io.on('connection', (socket) => {
        
        socket.on('action', (action) => {
            let data;
            let roomName;
            let room;
            let player;
            switch(action.type) {
                //Sent after successful log in
                case 'server/connected-user':
                    data = action.payload.user;
                    player = new Player(socket);
                    if(player.setPlayerAttributes(data)) {
                       conn.addPlayer(player);
                    } else {
                        //TODO send error message
                    }
                    
                    break;
                    
                //Updates user information
                case 'server/update-user':
                    data = action.payload.user;
                    
                    //update player in conn object
                    if(!conn.updatePlayer(data)) {
                        //TODO send error message   
                    }
                    break;
                    
                //user is joining a room
                case 'server/join-room':
                    roomName = [Object.keys(action.payload)[0]];    //the roomName
                    data = JSON.parse(JSON.stringify(action.payload[roomName]));
                    room = new Room(); //declare a new room
                    
                    if(!room.setRoomAttributes(data.room)) {
                        //TODO error message on join
                        return;
                    }
                    
                    if(data.gameType) { //user has initiated a game type room
                        switch(data.gameType) {
                            case 'two-player':
                                room.setGame(new Chess());
                                break;
                            case 'four-player':
                                room.setGame(new FourChess());
                                break;
                        }
                        
                        if(data.time) { //user has specified a time control
                            room.setTime(data.time);
                        }
                    }
                    
                    player = conn.findPlayerBySocket(socket);
                    
                    if(!player) {
                        //TODO send error message
                        return;
                    }
                    
                    
                    room.addPlayer(player);
                    conn.addRoom(room);
                    
                    break;
                    
                    
                //user is logging off
                case 'server/logout':
            }
            
            // connection(io, socket, action);
            // room(io, socket, action);
            // twoGame(io, socket, action);
            // fourGame(io, socket, action);
        });

        socket.on('disconnect', function() {
            if(clients[socket.id]) {
                //Get all the rooms that user is connected to and the user info
                const userObj = clients[socket.id]
                const joinedRooms = userObj.rooms;
                // console.log(rooms)
                mapObject(joinedRooms, (key, val) => {
                    let roomIndex;
                    let roomName = val;
                    //Check to see if users are still in the room
                    if(io.sockets.adapter.rooms[roomName]) {
                        let left_msg = userObj.user.username + " has left the room.";
                        let message_obj = {
                            user: userObj.user.username,
                            msg: left_msg,
                            thread: roomName,
                            picture: null,
                            event_type: 'user-left'
                        };
                        //Tell everyone that a user left
                        io.to(roomName).emit('action', {
                            type: 'user-room-left',
                            payload: {
                                name: roomName,
                                user: userObj,
                                message: message_obj
                            }
                        });
                        addMessageToRoom(roomName, message_obj);
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
                });
            }

            io.emit('action', {
                type: 'all-rooms',
                payload: rooms
            });
            delete clients[socket.id];
        });
    });
};
