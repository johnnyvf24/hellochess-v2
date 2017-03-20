const Notifications = require('react-notification-system-redux');
const {mapObject} = require('../utils/utils');
const Elo = require('elo-js');
const Connection = require('./Connection');
const Player = require('./players/Player');
const Room = require('./rooms/Room.js');

//Game Rules
const {FourChess} = require('../../common/fourchess');
const {Chess} = require('chess.js');
const {Crazyhouse} = require('crazyhouse.js');

//master connection object
let conn = new Connection();

module.exports.socketServer = function(io) {

    io.on('connection', (socket) => {
        
        function disconnectPlayerBySocket(socket) {
            let player = conn.getPlayerBySocket(socket);
            if(typeof player == 'object') {
                //Get all the rooms that user is connected to and the user info
                let roomsPlayerIsIn = conn.getPlayerRoomsByPlayerSocket(socket);
                
                roomsPlayerIsIn.map((room) => {
                    let roomName = room.getName();
                    socket.leave(roomName);
                    
                    if(io.sockets.adapter.rooms[roomName]) { //There are still players in the room
                        
                        if(room.removePlayerBySocket(player.getSocket())) { // player has been successfully removed
                        
                            let leftMessage = `${player.getUsername()} has left the room.`;
                            let messageObj = {
                                user: player.getPlayerAttributes(),
                                msg: leftMessage,
                                thread: roomName,
                                picture: null,
                                event_type: 'user-left'
                            }
                            
                            room.addMessage(messageObj);
                            
                            //Tell everyone in a room that a user has left
                            io.to(roomName).emit('action', {
                                type: 'user-room-left',
                                payload: {
                                    name: roomName,
                                    user: player.getPlayerAttributes(),
                                    message: messageObj
                                }
                            });
                            
                            if(!conn.removePlayerBySocket(player.getSocket())) {
                                //TODO error message
                            }
                        }
                        
                    } else {    //this user was the last player in the room
                        if(conn.removeRoomByName(roomName)) {
                            //TODO not sure if anything else is needed here
                        } else {
                            console.log("could not delete room " + roomName);
                        }
                    }
                });
                
                io.emit('action', {
                    type: 'all-rooms',
                    payload: conn.getAllRooms()
                });
            }
        }
        
        socket.on('action', (action) => {
            let data;
            let roomName;
            let room;
            let player;
            let turn;
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
                    
                case 'server/get-room':
                    roomName = action.payload;
                    room = conn.getRoomByName(roomName);
                    if(room == false) {
                        return;
                    }
                    
                    socket.emit('action', {
                        type: 'joined-room',
                        payload: room.getRoom()
                    });
                    
                    break;
                //user is joining a room
                case 'server/join-room':
                    roomName = [Object.keys(action.payload)[0]];    //the roomName
                    data = JSON.parse(JSON.stringify(action.payload[roomName]));
                    room = conn.getRoomByName(roomName);
                    
                    //check to see if room previously existed
                    if(room == false) { 
                        room = new Room(); //declare a new room
                        
                        if(!room.setRoomAttributes(data.room)) {
                            //TODO error message on join
                            return;
                        }
                        
                        if(data.gameType) { //user has initiated a game type room
                            switch(data.gameType) {
                                case 'two-player':
                                    room.setGame(new Chess(), 'two-player');
                                    break;
                                case 'four-player':
                                    room.setGame(new FourChess(), 'four-player');
                                    break;
                                case 'crazyhouse':
                                    room.setGame(new Crazyhouse(), 'crazyhouse');
                                    break;
                            }
                            
                            if(data.time) { //user has specified a time control
                                room.setTime(data.time);
                            }
                        }
                        
                        //add the room to the list of rooms
                        conn.addRoom(room);
                    }
        
                    player = conn.getPlayerBySocket(socket);
                    
                    if(!player) {
                        //TODO send error message
                        return;
                    }
                    
                    room.addPlayer(player);
                    
                    let joinedMessage = `${player.getUsername()} has joined the room.`;
                    let msgObj = {
                        user: player.getPlayerAttributes(),
                        msg: joinedMessage,
                        thread: room.getName(),
                        picture: null,
                        event_type: 'user-joined'
                    };
                    
                    //Tell everyone in the room that a new user has connnected
                    io.to(room.getName()).emit('action', {
                        type: 'user-room-joined',
                        payload: room.getRoom(),
                        message: msgObj
                    });
                    
                    room.addMessage(msgObj);
                    
                    //Tell the current user that they have joined the room
                    socket.emit('action', {
                        type: 'joined-room',
                        payload: room.getRoom()
                    });
        
                    
                    //send a list of rooms to all members
                    io.emit('action', {
                        type: 'all-rooms',
                        payload: conn.getAllRooms()
                    });
                    
                    break;
                    
                //User is requesting a list of rooms
                case 'server/get-rooms':
                    io.emit('action', {
                        type: 'all-rooms',
                        payload: conn.getAllRooms()
                    });
                    break;
                
                //someone is sending a new message
                case 'server/new-message':
                    break;
                    
                //user is leaving a room (by clicking 'x')
                case 'server/leave-room':
                    player = conn.getPlayerBySocket(socket);
                    roomName = action.payload;
                    socket.leave(roomName);
                    
                    socket.emit('action', {
                        type: 'left-room',
                        payload: roomName
                    });
                    
                    room = conn.getRoomByName(roomName);
                    
                    if (io.sockets.adapter.rooms[roomName]) { //there are still users in the room
                    
                        //TODO add check to see if player was playing a game
                        
                        let leftMessage = player.getUsername() + " has left the room.";
                        let messageObj = {
                            user: player.getPlayerAttributes(),
                            msg: leftMessage,
                            thread: roomName,
                            picture: null,
                            event_type: 'user-left'
                        };
            
                        room.addMessage(messageObj);
            
                        //Tell everyone in the room that a user has disconnnected
                        io.to(roomName).emit('action', {
                            type: 'user-room-left',
                            payload: {
                                name: roomName,
                                user: player.getPlayerAttributes(),
                                message: messageObj
                            }
                        });
        
                    } else { //this was the final user
                        if(conn.removeRoomByName(roomName)) {
                            //TODO not sure if anything else is needed here
                        } else {
                            console.log("could not delete room " + roomName);
                        }
                    }
                    
                    if(room.removePlayerBySocket(player.getSocket())) {
                        //TODO error message
                    }
        
                    //Update the user count for that room
                    io.emit('action', {
                        type: 'all-rooms',
                        payload: conn.getAllRooms()
                    });
                    
                    break;
                    
                //A user is requesting to play a color
                case 'server/sit-down-board':
                    console.log(action.payload)
                    break;
                    
                //user is logging off
                case 'server/logout':
                    socket.emit('action', {type: 'LOGOUT_SUCCESS'});
                    disconnectPlayerBySocket(socket);
                    break;
            }
        });

        socket.on('disconnect', function() {
            disconnectPlayerBySocket(socket);
        });
    });
};
