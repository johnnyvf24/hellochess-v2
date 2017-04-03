import Player from '../../../models/players/Player';
import AI from '../../../models/players/AI';
import Room from '../../../models/rooms/Room';
import Game from '../../../models/games/Game';
import Message from '../../../models/rooms/Message';

//Game Rules
import FourGame from '../../../models/games/FourGame';
import Standard from '../../../models/games/Standard';
import CrazyHouse from '../../../models/games/CrazyHouse';

//server environment
const dotenv = require('dotenv').load();

const env = process.env.NODE_ENV || "development";

module.exports = function(io, socket, connection) {
    
    socket.on('new-message', data => {
        let roomName: string = data.thread;
        let player: Player = connection.getPlayerBySocket(socket);
        let room: Room = connection.getRoomByName(roomName);
        
        //add the message to the room
        room.addMessage(new Message(player, data.msg, roomName));
        
        // tell everyone there is a new message
        io.to(room.name).emit('update-room', room.getRoom())
    });
    
    socket.on('sit-down-board', data => {
        let roomName: string = data.roomName;
        let room: Room = connection.getRoomByName(roomName);
        let player: Player;
        let playerType = data.profile.type;
        if (typeof playerType !== "undefined" && playerType === "computer") {
            
            player = new AI(io, data.profile.username);
            player.type = 'computer'
        } else {
            player = connection.getPlayerBySocket(socket);
        }
        let color: string = data.color;
        room.game.addPlayer(player, color);
        let timeValue = room.time.value * 60 * 1000;
        room.game.setColorTime(color, timeValue);

        if (room.gameReady()) {
            // start the game if all players are seated
            room.startGame();
        }
        io.to(roomName).emit('update-room', room.getRoom());
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
                    room = new Room(io, new Standard(io));
                    break;
                case 'four-player':
                    room = new Room(io, new FourGame(io));
                    break;
                case 'crazyhouse':
                    room = new Room(io, new CrazyHouse(io));
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
    
    socket.on('four-new-move', data => {
        let roomName = data.thread;
        let room: Room = connection.getRoomByName(roomName);
        let game: Game = room.game;
        let move = data.move;
    })
};