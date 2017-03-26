import Player from '../logic/players/Player';
import Room from '../logic/rooms/Room';
import Message from '../logic/rooms/Message';

//Game Rules
const FourGame = require('../logic/games/FourGame');
const Standard = require('../logic/games/Standard');
const CrazyHouse = require('../logic/games/CrazyHouse');

module.exports = function(io, socket, connection) {
    
    socket.on('get-room', data => {
        if(!data) {
            return;
        }
        let roomName = data;
        connection.emitRoomByName(roomName, socket);
    });
    
    socket.on('new-message', data => {
        let roomName: string = data.thread;
        let player: Player = connection.getPlayerBySocket(socket);
        let room: Room = connection.getRoomByName(roomName);
        
        //add the message to the room
        room.addMessage(new Message(player, data.msg, roomName));
        
        // tell everyone there is a new message
        io.to(room.name).emit('joined-room', room.getRoom())
    });
    
    socket.on('leave-room', data => {
        let roomName: string = data;
        
        //retrieve the user and room which are being updated
        let room: Room = connection.getRoomByName(roomName);
        let player: Player = connection.getPlayerBySocket(socket);
        
        if(!room || !player || !room.removePlayer(player)) {
            //TODO error
        }
        
        if (room.empty()) { //there are no users in the room
            if(connection.removeRoomByName(roomName)) {
                //TODO not sure if anything else is needed here
            } else {
                console.log("could not delete room " + roomName);
            }
        }
        
        connection.emitAllRooms();
    });
    
    socket.on('join-room', data => {
        if(!data || !data.room || !data.room.name) {
            return;
        }
        
        
        let roomName = data.room.name;
        let room: Room = connection.getRoomByName(roomName);
        
        if(!room) { //the room did not previously exist
        
            if(!data.gameType) {
                //TODO error
                return;
            }
            
            switch(data.gameType) {
                case 'standard':
                    room = new Room(io, new Standard());
                    break;
                case 'four-player':
                    room = new Room(io, new FourGame());
                    break;
                case 'crazyhouse':
                    room = new Room(io, new CrazyHouse());
                    break;
            }
            
            if(!room.setRoomAttributes(data.room)) {
                //TODO error
                return;
            }
            
            if(data.time) { //user has specified a time control
                room.time = data.time;
            }
            
            connection.addRoom(room);
        }
        let player: Player = connection.getPlayerBySocket(socket);
        
        if(!player) {
            //TODO error
            return;
        }
        //remove previous instances of this player
        room.removePlayer(player)
        
        room.addPlayer(player);
        connection.emitAllRooms();
        
    });
};