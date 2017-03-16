module.exports = class Connection {
    constructor() {
        this.players = [];
        this.rooms = [];
    }
    
    addRoom(roomObj) {
        this.rooms.push(roomObj);
    }
    
    getRoomByName(roomName) {
        if(!roomName) {
            return false;
        }
        let roomFound = false;
        this.rooms.map((room) => {
            if(room.getName() == roomName) {
                roomFound = room;
            }
        });
        return roomFound;
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
    
    getAllRooms() {
        let rooms = [];
        this.rooms.map((room) => {
             rooms.push(room.getRoom());
        });
        
        return rooms;
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
    
    addPlayer(playerObj) {
        this.players.push(playerObj);
        playerObj.getSocket().emit('action', {
            type: 'connected'
        });
    }
    
    getPlayerBySocket(socket) {
        if(!socket) {
            return false;
        }
        let p = null;
        this.players.map((player) => {
            if(player.getSocket().id == socket.id) {
                p = player;
            }
        });
        
        return p;
    }
    
    updatePlayer(data) {
        //check to see if the player is in the player list
        this.players.map((player) => {
            if(player.getPlayerId() === data._id) {
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
            if(player._id !== playerId) {
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