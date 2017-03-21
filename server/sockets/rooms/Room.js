const Game = require('../games/Game.js');
const {FourChess} = require('../../../common/fourchess');

let numRooms = 0;

module.exports = class Room {
    
    constructor() {
        this.players = [];  //a list of all the players in a room
        this.messages = []; //a list of all the messages stored for that room
        numRooms++;
        this.id = numRooms;
    }
    
    setRoomAttributes(roomObj) {
        if( typeof roomObj.private == undefined
            || typeof roomObj.voiceChat == undefined 
            || typeof roomObj.maxPlayers == undefined
            || typeof roomObj.name == undefined) {
            return false;        
        }
        this.private = roomObj.private;
        this.voiceChat = roomObj.voiceChat;
        this.maxPlayers = roomObj.maxPlayers;
        this.name = roomObj.name;
        return true;
    }
    
    getRoom() {
        if(this.game.fen()) {
            return {
                id: this.id,
                room: {
                    name: this.name,
                    private: this.private,
                    voiceChat: this.voiceChat,
                    maxPlayers: this.maxPlayers
                },
                users: this.getAllRoomPlayersWithoutSockets(),
                messages: this.messages,
                time: this.time,
                gameType: this.gameType,
                fen: this.game.fen(),
                white: this.white,
                black: this.black,
                gold: this.gold,
                red: this.red
            }
        }
        return {
            room: {
                name: this.name,
                private: this.private,
                voiceChat: this.voiceChat,
                maxPlayers: this.maxPlayers
            },
            users: this.getAllRoomPlayersWithoutSockets(),
            messages: this.messages,
            time: this.time,
            gameType: this.gameType,
            lastMove: this.lastMove,
            turn: this.turn
        }
    }
    
    addPlayer(playerObj) {
        if(! (typeof playerObj.getSocket == 'function')) {
            return false;
        }
        playerObj.getSocket().join(this.name);
        this.players.push(playerObj);
        playerObj.getSocket().emit('action', {
            type: 'joined-room',
            payload: {
                room: {
                    name: this.name,
                    private: this.private,
                    voiceChat: this.voiceChat,
                    maxPlayers: this.maxPlayers
                },
                users: this.getAllRoomPlayersWithoutSockets(),
                messages: this.messages,
            }
        });
        return true;
    }
    
    //Remove a player from the room;
    removePlayer(playerId) {
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
    
    //Remove a player from a room by their socket
    removePlayerBySocket(playerSocket) {
        let foundPlayer = false;
        this.players = this.players.filter((player) => {
            if(playerSocket.id !== player.getSocket().id) {
                return player;
            } else {
                foundPlayer = true;
            }
        })
        return foundPlayer;
    }
    
    //Add a game object to the room
    setGame(gameObj, gameType) {
        this.game = gameObj;
        this.gameType = gameType;
    }
    
    //set time control for the room
    setTime(timeObj) {
        if(!timeObj.increment || !timeObj.value) {
            return false;
        }
        this.time = timeObj;
        return true;
    }
    
    //add a message to the room
    addMessage(messageObj) {
        this.messages.push(messageObj);
    }
    
    //add all players in the room
    getAllRoomPlayers() {
        return this.players;
    }
    
    //checks to see if the player is in a specified room
    isPlayerInRoom(socket) {
        let playerFound = false;
        this.players.map((player) => {
            if(player.getSocket().id === socket.id) {
                playerFound = true;
            } 
        });
        
        return playerFound;
    }
    
    getAllRoomPlayersWithoutSockets() {
        let players = this.players;
        let newPlayersList = [];
        players.map((player) => {
            newPlayersList.push(player.getPlayerAttributes());
        });
        
        return newPlayersList;
    }
    
    getName() {
        return this.name;
    }
    
    getGame() {
        return this.game;
    }
    
    getGameType() {
        return this.gameType;
    }
    
    sitPlayerColor(player, color) {
        if(!player || !color) {
            return false;
        }
        
        player.time = this.time.value * 60 * 1000;
        
        //get which color the player is sitting down as
        switch(color) {
            case 'w':
                this.white = player;
                return true;
            case 'b':
                this.black = player
                return true;
            case 'g':
                this.gold = player;
                return true;
            case 'r':
                this.red = player;
                return true;
        }
        
        return false;
    }
    
    //check to see if the game is ready to begin
    gameReady() {
        if(!this.gameType) {
            return false;
        }
        
        switch(this.gameType) {
            case 'two-player':
                if(this.white && this.black) {
                    return true;
                }
                break;
            case 'crazyhouse':
                if(this.white && this.black) {
                    return true;
                }
                break;
            case 'four-player':
                if(this.white && this.black 
                    && this.gold && this.red) {
                    return true;
                }
                break;
        }
        
        return false;
    }
    
    //begin the game
    startGame() {
        this.turn = 'white';
        this.lastMove = Date.now();
    }
    
    getPlayerByColor(color) {
        switch(color) {
            case 'w':
                return this.white;
            case 'g':
                return this.gold;
            case 'b':
                return this.black;
            case 'r':
                return this.red;
        }   
    }
}