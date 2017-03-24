import Player from './players/Player';
import Room from './rooms/Room';

export default class Connection {
    private players: Player[];
    private rooms: Room[];
    
    constructor(private io: any) {
        this.players = [];
        this.rooms = [];
    }
    
    addRoom(roomObj: Room): void {
        this.rooms.push(roomObj);
    }
    
    emitRoomByName(roomName: string, socket: any) {
        let room : Room = this.getRoomByName(roomName);
        
        if(!room) {
            return;
        }
        
        socket.emit('action', {
            type: 'joined-room',
            payload: room.getRoom()
        });
    }
    
    getRoomByName(roomName: string): Room {
        if(!roomName) {
            return null;
        }
        this.rooms.map((room) => {
            if(room.getName() == roomName) {
                return room;
            }
        });
    }
    
    removeRoomByName(roomName) {
        if(!roomName) {
            return false;
        }
        let roomRemoved = false;
        this.rooms = this.rooms.filter((room) => {
            if(room.getName() !== roomName) {
                return room;
            } else {
                roomRemoved = true;
            }
        });
        
        return roomRemoved;
    }
    
    emitAllRooms() {
        //send a list of rooms to all members
        this.io.emit('action', {
            type: 'all-rooms',
            payload: this.getAllRooms()
        });
    }
    
    getAllRooms() {
        if(!this.rooms) {
            return null;
        }
        let tempRooms = [];
        
        this.rooms.map((room) => {
             tempRooms.push(room.getRoom());
        });
        
        return tempRooms;
    }
    
    //get all the rooms a player is connected to
    getPlayerRoomsByPlayerSocket(playerSocket) {
        let rooms = [];
        this.rooms.map((room) => {
            if(room.isPlayerInRoom(playerSocket)) {
                rooms.push(room);
            }
        });
        
        return rooms;
    }
    
    addPlayer(player: Player) {
        this.players.push(player);
        player.getSocket().emit('connected-user', {hello: true});
    }
    
    getPlayerBySocket(socket: any) {
        if(!socket || !this.players) {
            return null;
        }
        
        this.players.map((player) => {
            if(player.getSocket().id == socket.id) {
                return player;
            }
        });
    }
    
    updatePlayer(data) {
        //check to see if the player is in the player list
        this.players.map((player) => {
            if(player.id === data._id) {
                let status = player.setPlayerAttributes(data);
                return status;
            } 
        });
        return false;   //player did not exist
    }
    
    //Remove a player from the room;
    removePlayer(playerId) {
        if(!playerId) {
            return false;
        }
        let foundPlayer = false;
        this.players = this.players.filter((player) => {
            if(player.id !== playerId) {
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
            if(player.getSocket()._id !== playerSocket.id) {
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