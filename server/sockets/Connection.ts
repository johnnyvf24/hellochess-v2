import Player from '../game_models/players/Player';
import Room from '../game_models/rooms/Room';
//Game Rules
import FourGame from '../game_models/games/FourGame';
import Standard from '../game_models/games/Standard';
import CrazyHouse from '../game_models/games/CrazyHouse';

export default class Connection {
    private players: Player[];
    private rooms: Room[];
    
    constructor(private io) {
        this.players = [];
        this.rooms = [];
    }
    
    createNewRoom(roomName: string, gameType: string, time: any, roomObj: any): Room {
        let newRoomName;
        let roomCopyCounter = 1;
        let room: Room = this.getRoomByName(roomName);
        while (room) {
            // if a room with this name already exists,
            // add a (1) to the end of the name, then try (2), etc.
            if (roomCopyCounter > 1) {
                roomName = roomName.slice(0, -4);
            }
            newRoomName = `${roomName} (${roomCopyCounter++})`;
            roomName = newRoomName;
            room = this.getRoomByName(newRoomName);
        }
        roomObj.name = roomName;
        switch(gameType) {
            case 'standard':
                room = new Room(this.io, new Standard(this.io, roomName, time, this));
                break;
            case 'four-player':
                room = new Room(this.io, new FourGame(this.io, roomName, time, this));
                break;
            case 'crazyhouse':
                room = new Room(this.io, new CrazyHouse(this.io, roomName, time, false, this));
                break;
            case 'crazyhouse960':
                room = new Room(this.io, new CrazyHouse(this.io, roomName, time, true, this));
                break;
        }
        if (time) {
            room.time = time;
        }
        room.setRoomAttributes(roomObj);
        this.addRoom(room);
        return room;
    }
    
    addRoom(roomObj: Room): void {
        this.rooms.push(roomObj);
    }
    
    getRoomById(id: number) {
        return this.rooms.find(room => room.id === id);
    }
    
    getRoomByName(roomName: string): Room {
        if(!roomName) {
            return null;
        }
        return this.rooms.find(room => room.name === roomName);
    }
    
    removeRoomByName(roomName: string): boolean {
        if(!roomName) {
            return false;
        }
        let roomRemoved = false;
        this.rooms = this.rooms.filter((room) => {
            if(room.name !== roomName) {
                return room;
            } else {
                
                room.clearTimer();
                if(room.game) {
                    room.game.killEngineInstance();
                }
                roomRemoved = true;
            }
        });
        
        return roomRemoved;
    }
    
    emitAllRooms() {
        //send a list of rooms to all members
        this.io.emit('all-rooms', this.getAllRooms());
    }
    
    getAllRooms() {
        if(!this.rooms) {
            return null;
        }
        return this.rooms.map(room => room.getRoomCondensed());
    }
    
    getPlayerRoomsByPlayer(player: Player): Room[]{
        return this.rooms.filter(room => room.isPlayerInRoom(player));
    }
    
    addPlayer(player: Player):void {
        this.players.push(player);
        
        player.socket.emit('connected-user');
    }
    
    getPlayerBySocket(socket: any) : Player{
        if(!socket || !this.players) {
            return null;
        }
        return this.players.find(player => player.socket.id === socket.id);
    }
    
    duplicateUser(playerId: string) {
        if(!this.players) {
            return false;
        }
        return this.players.some(player => player.playerId === playerId);
    }
    
    updatePlayer(data) {
        //check to see if the player is in the player list
        this.players.map((player) => {
            if(player.playerId === data._id || player.playerId === data.playerId) {
                let status = player.username = data.username;
                player.standard_ratings = data.standard_ratings;
                player.fourplayer_ratings = data.fourplayer_ratings;
                player.crazyhouse_ratings = data.crazyhouse_ratings;
                player.crazyhouse960_ratings = player.crazyhouse960_ratings;
                return status;
            } 
        });
        
        this.rooms.map(room => {
            room.updatePlayer(data);
        });
    }
    
    //Remove a player from the room;
    removePlayer(playerId) {
        if(!playerId) {
            return false;
        }
        let foundPlayer = false;
        this.players = this.players.filter((player) => {
            if(player.playerId !== playerId) {
                return player;
            } else {
                foundPlayer = true;
            }
        })
        
        return foundPlayer;
    }
    
    //remove a player by their socket obj
    removePlayerBySocket(playerSocket) {
        if(!playerSocket) {
            return false;
        }
        let foundPlayer = false;
        this.players = this.players.filter((player) => {
            if(player.socket._id !== playerSocket.id) {
                return player;
            } else {
                foundPlayer = true;
            }
        })
        
        return foundPlayer;
    }
    
    getPlayers() {
        return this.players;
    }
    
    getNumberOfPlayers() {
        return this.players.length;
    }
}