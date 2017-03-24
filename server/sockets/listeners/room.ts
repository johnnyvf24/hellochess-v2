import Player from '../logic/players/Player';
import Room from '../logic/rooms/Room';

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
        
        room.addPlayer(player);
        connection.emitAllRooms();
        
    });
};