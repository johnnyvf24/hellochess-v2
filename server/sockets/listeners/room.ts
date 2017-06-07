const Notifications = require('react-notification-system-redux');

import Player from '../../game_models/players/Player';
import AI from '../../game_models/players/AI';
import Room from '../../game_models/rooms/Room';
import Game from '../../game_models/games/Game';
import {Message, ResignMessage, AbortMessage} from '../../game_models/rooms/Message';

//Game Rules
import FourGame from '../../game_models/games/FourGame';
import Standard from '../../game_models/games/Standard';
import CrazyHouse from '../../game_models/games/CrazyHouse';

//server environment
const dotenv = require('dotenv').load();

const env = process.env.NODE_ENV || "development";

module.exports = function(io, socket, connection) {
    
    socket.on('new-message', data => {
        let roomName: string = data.thread;
        let player: Player = connection.getPlayerBySocket(socket);
        let room: Room = connection.getRoomByName(roomName);
        if(!room) return;
        
        //add the message to the room
        room.addMessage(new Message(player, data.msg, roomName));
        
        // tell everyone there is a new message
        io.to(room.name).emit('update-room', room.getRoom());
    });
    
    socket.on('sit-down-board', data => {
        let roomName: string = data.roomName;
        let room: Room = connection.getRoomByName(roomName);
        if(!room) return;
        
        let player: Player;
        if(!data.profile) {
            return;
        }
        let playerType = data.profile.type;
        let playerLevel = data.profile.level;
        if (typeof playerType !== "undefined" && playerType === "computer" && typeof playerLevel === "number") {
            player = new AI(io, data.profile.username, playerLevel);
            player.type = 'computer';
        } else {
            player = connection.getPlayerBySocket(socket);
        }
        let color: string = data.color;
        room.game.addPlayer(player, color);
        let timeValue = room.time.value * 60 * 1000;
        room.game.setColorTime(color, timeValue);

        if (room.gameReady()) {
            // start the game if all players are seated
            room.startGame(connection);
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
            // io.to(room.name).emit('update-room', {room {name: roomName}};
            connection.emitAllRooms();
            return;
        }
        
        if (room.empty()) { //there are no users in the room
            if(connection.removeRoomByName(roomName)) {
                //TODO not sure if anything else is needed here
            } else {
                console.log("could not delete room " + roomName);
            }
        } else {
            if(room.game && room.game.gameStarted == false) {
                room.game.removePlayerFromAllSeats(player);
            }
            io.to(room.name).emit('update-room', room.getRoom());
        }
        
        connection.emitAllRooms();
    });
    
    socket.on('create-room', data => {
        if (!data || !data.room || !data.room.name) {
            return;
        }
        let roomName = data.room.name;
        let room: Room = connection.createNewRoom(roomName, data.gameType, data.time, data.room, data.host);
        if(!data.gameType) {
            //TODO error
            return;
        }
        let player: Player = connection.getPlayerBySocket(socket);
        if(!player) {
            return;
        }
        
        if(room.isPlayerInRoom(player) == true) {
            return;
        }
        
        if(!player) {
            //TODO error
            return;
        }
        
        if(room.voiceChat && room.getNumberOfPlayers() == 10) {
            
            //Tell the player that this is a voice chat room and
            //there are too many players
            let notificationOpts = {
                title: `There are too many players`,
                message: 'voice chat enabled rooms are limited to 10 users',
                position: 'tr',
                autoDismiss: 5,
            };
            
            socket.emit('action', Notifications.info(notificationOpts));
            return;
        } 
        
        //remove previous instances of this player
        room.removePlayer(player)
        
        room.addPlayer(player);
        connection.emitAllRooms();
    });
    
    socket.on('join-room', data => {
        if(!data || !data.room || !data.room.name) {
            return;
        }
        let roomName = data.room.name;
        let room: Room = connection.getRoomByName(roomName);
        if (!room) {
            room = connection.createNewRoom(roomName, data.gameType, data.time, data.room);
        }
        let player: Player = connection.getPlayerBySocket(socket);
        if(!player) {
            return;
        }
        
        if(room.isPlayerInRoom(player) == true) {
            return;
        }
        
        if(!player) {
            //TODO error
            return;
        }
        
        if(room.voiceChat && room.getNumberOfPlayers() == 10) {
            
            //Tell the player that this is a voice chat room and
            //there are too many players
            let notificationOpts = {
                title: `There are too many players`,
                message: 'voice chat enabled rooms are limited to 10 users',
                position: 'tr',
                autoDismiss: 5,
            };
            
            socket.emit('action', Notifications.info(notificationOpts));
            return;
        } 
        
        //remove previous instances of this player
        room.removePlayer(player)
        
        room.addPlayer(player);
        connection.emitAllRooms();
    });
    
    socket.on('kill-ais', data => {
        let roomName: string = data;
        let room: Room = connection.getRoomByName(roomName);
        if(!room) return;
        if(room.game) {
            room.game.endAndSaveGame(false);
            io.to(roomName).emit('update-room', room.getRoom());
        }
    });
    
    socket.on('new-move', data => {
        let roomName = data.thread;
        let room: Room = connection.getRoomByName(roomName);
        if(!room) return;
        let game: Game = room.game;
        let move = data.move;
        room.makeMove(move, data.moveTime);
    });
    
    socket.on('four-new-move', data => {
        let roomName = data.thread;
        let room: Room = connection.getRoomByName(roomName);
        if(!room) return;
        let game: Game = room.game;
        let move = data.move;
        room.makeMove(move, data.moveTime);
    });
    
    socket.on('remove-ai-player', data => {
        let roomName = data.thread;
        let player = data.player;
        
        let room: Room = connection.getRoomByName(roomName);
        if(!room || !room.game) {
            return;
        }
        
        room.game.removePlayerByPlayerId(player.playerId);
        io.to(room.name).emit('update-room', room.getRoom());
    });
    
    socket.on('resign', data => {
        let roomName = data.roomName;
        let room: Room = connection.getRoomByName(roomName);
        if(!room) {
            return;
        }
        
        let player: Player = connection.getPlayerBySocket(socket);
        
        if(!room.game || !player) {
            return;
        }
        
        //Notify all players that a player has resigned
        let notificationOpts = {
            title: `${player.username} has resigned!`,
            position: 'tr',
            autoDismiss: 5,
        };
        
        //add resign message to the room
        room.addMessage(new ResignMessage(player, data.msg, roomName));
        
        io.to(room.name).emit('action', Notifications.info(notificationOpts));
        
        room.game.setPlayerResignByPlayerObj(player);
        room.clearTimer();
        room.game.endAndSaveGame(false);
        
        
        io.to(room.name).emit('update-room', room.getRoom());
    });
    
    socket.on('four-resign', data => {
        let roomName = data.roomName;
        let room: Room = connection.getRoomByName(roomName);
        if(!room) {
            return;
        }
        
        let player: Player = connection.getPlayerBySocket(socket);
        
        if(!room.game || !player) {
            return;
        }
        
        //add resign message to the room
        room.addMessage(new ResignMessage(player, data.msg, roomName));
        
        //Notify all players that a player has resigned
        let notificationOpts = {
            title: `${player.username} has resigned!`,
            position: 'tr',
            autoDismiss: 5,
        };
        
        io.to(room.name).emit('action', Notifications.info(notificationOpts));
        
        room.clearTimer();
        room.game.setPlayerResignByPlayerObj(player);
        
        if(room.game.gameStarted == true) {
            room.startTimer();
            if(room.game.currentTurnPlayer() instanceof AI) {
                room.game.engineGo();
            }
        }
        
        io.to(room.name).emit('update-room', room.getRoom());
    });
    
    socket.on('abort', data => {
        let roomName = data;
        let room: Room = connection.getRoomByName(roomName);
        if (!room) {
            return;
        }
        let player: Player = connection.getPlayerBySocket(socket);
        if(!room.game || !player) {
            return;
        }
        room.clearTimer();
        room.game.abort();
        
        room.addMessage(new AbortMessage(player, null, roomName));
        
        let notificationOpts = {
            title: `${player.username} aborted the game.`,
            position: 'tr',
            autoDismiss: 5,
        };
        
        io.to(room.name).emit('action', Notifications.info(notificationOpts));
        
        io.to(room.name).emit('update-room', room.getRoom());
    });
    
    socket.on('draw', data => {
        let roomName = data.roomName;
        let room: Room = connection.getRoomByName(roomName);
        if(!room) {
            return;
        }
        
        let player: Player = connection.getPlayerBySocket(socket);
        
        if(!room.game || !player) {
            return;
        }
        
        let color = null;
        
        if(room.game.white.playerId == player.playerId) {
            color = 'black';
        } else {
            color = 'white';
        }
        
        if(room.game[color].socket) {
            room.game[color].socket.emit('draw-request', {
                thread: roomName
            });
        }
        
        
        
        let notif = {
            title: `Draw request sent by ${player.username}!`,
            position: 'tr',
            autoDismiss: 2,
        };
        io.to(roomName).emit('action', Notifications.info(notif));
    });
    
    socket.on('accept-draw', data => {
        let roomName = data.roomName;
        let room: Room = connection.getRoomByName(roomName);
        if(!room) {
            return;
        }
        
        let player: Player = connection.getPlayerBySocket(socket);
        
        if(!room.game || !player) {
            return;
        }
        
        //Notify all players that the game has ended in a draw
        let notificationOpts = {
            title: 'Game Over',
            message: 'The game ended in a draw!',
            position: 'tr',
            autoDismiss: 5,
        };
        
        io.to(roomName).emit('action', Notifications.warning(notificationOpts));
        
        room.game.endAndSaveGame(true);
        io.to(room.name).emit('update-room', room.getRoom());
    });
};