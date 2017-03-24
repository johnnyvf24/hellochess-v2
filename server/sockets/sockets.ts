const Notifications = require('react-notification-system-redux');
const {mapObject} = require('../utils/utils');
const Elo = require('elo-js');
import Connection from './Connection';
import Player from './players/Player';
const Room = require('./rooms/Room');

//Game Rules
const FourGame = require('./games/FourGame');
const Standard = require('./games/Standard');
const CrazyHouse = require('./games/CrazyHouse');

module.exports.socketServer = function(io) {
    //master connection object
    let conn = new Connection(io);

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
            let color;
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
                    conn.emitRoomByName(roomName, socket);
                    break;
                //user is joining a room
                case 'server/join-room':
                    roomName = [Object.keys(action.payload)[0]];    //the roomName
                    data = JSON.parse(JSON.stringify(action.payload[roomName]));
                    room = conn.getRoomByName(roomName);
                    
                    //check to see if room previously existed
                    if(room == false) { 
                        room = new Room(io); //declare a new room
                        
                        if(!room.setRoomAttributes(data.room)) {
                            //TODO error message on join
                            return;
                        }
                        
                        if(data.gameType) { //user has initiated a game type room
                            switch(data.gameType) {
                                case 'two-player':
                                    room.setGame(new Standard(io));
                                    break;
                                case 'four-player':
                                    room.setGame(new FourGame(io));
                                    break;
                                case 'crazyhouse':
                                    room.setGame(new CrazyHouse(io));
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
                    conn.emitAllRooms();
                    
                    break;
                    
                //User is requesting a list of rooms
                case 'server/get-rooms':
                    conn.emitAllRooms();
                    break;
                
                //someone is sending a new message
                case 'server/new-message':
                    roomName = action.payload.thread;
                    room = conn.getRoomByName(roomName);
                    if(room == false) {
                        return;
                    }
                    room.emitMessage(action.payload);
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
                    
                    //Update all the rooms
                    conn.emitAllRooms();

                    break;
                    
                //A user is requesting to play a color
                case 'server/sit-down-board':
                    roomName = action.payload.roomName;
                    
                    //get the existing room
                    room = conn.getRoomByName(roomName);
                    
                    //check if the room was retrieved successfully
                    if(room == false) {
                        //TODO error
                        return;
                    }
                    
                    switch(room.getGameType()) {
                        case 'crazyhouse':
                        case 'two-player':
                        case 'four-player':
                            color = action.payload.color;
                            player = action.payload.profile;
                            if(!color || !player) {
                                return;
                            }
                            
                            let deletedPlayer = room.removePlayerFromBoardSeats(player);
                            
                            if(deletedPlayer) {
                                io.to(roomName).emit('action', {
                                    type: `up-${deletedPlayer}`,
                                    payload: {
                                        name: roomName
                                    }
                                });
                            }
                            
                            if(!room.sitPlayerColor(player, color)) {
                                //TODO error
                                return;   
                            }
                            
                            //tell everyone in the room
                            io.to(roomName).emit('action', {
                                type: `sit-down-${color}`,
                                payload: {
                                    thread: roomName,
                                    player: room.getPlayerByColor(color)
                                }
                            });
                            break;
                    }
                    
                    //Check to see if the game is ready to begin
                    if(room.gameReady()) {
                        room.startGame();
                    } else {
                        
                    }
                    
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
