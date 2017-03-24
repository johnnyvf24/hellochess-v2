const Notifications = require('react-notification-system-redux');
import Player from '../players/Player';

export default class Room {
    private players: Player [];
    private messages: any[];
    private priv: boolean;
    private id: number;
    private voiceChat: boolean;
    private maxPlayers: number;
    private name: string;
    private time: any;
    private game: any;
    
    static numRooms: number = 0;
    
    constructor(private io: any) {
        this.messages = []; //a list of all the messages stored for that room
        Room.numRooms++;
        this.id = Room.numRooms;
    }
    
    setRoomAttributes(roomObj) {
        if( typeof roomObj.private == undefined
            || typeof roomObj.voiceChat == undefined 
            || typeof roomObj.maxPlayers == undefined
            || typeof roomObj.name == undefined) {
            return false;        
        }
        this.priv = roomObj.private;
        this.voiceChat = roomObj.voiceChat;
        this.maxPlayers = roomObj.maxPlayers;
        this.name = roomObj.name;
        return true;
    }
    
    getRoom(): Object {
        return {
            id: this.id,
            room: {
                name: this.name,
                private: this.priv,
                voiceChat: this.voiceChat,
                maxPlayers: this.maxPlayers
            },
            users: this.getAllRoomPlayersWithoutSockets(),
            messages: this.messages,
            time: this.time,
            game: this.game.getInfo()
        }
    }
    
    addPlayer(playerObj) {
        if(! (typeof playerObj.getSocket == 'function')) {
            return false;
        }
        playerObj.getSocket().join(this.name);
        
        this.players.push(playerObj);
        let joinedMessage = `${playerObj.getUsername()} has joined the room.`;
        let msgObj = {
            user: playerObj.getPlayerAttributes(),
            msg: joinedMessage,
            thread: this.getName(),
            picture: null,
            event_type: 'user-joined'
        };
        
        //Tell everyone in the room that a new user has connnected
        this.io.to(this.getName()).emit('action', {
            type: 'user-room-joined',
            payload: this.getRoom(),
            message: msgObj
        });
        
        this.addMessage(msgObj);
        
        playerObj.getSocket().emit('action', {
            type: 'joined-room',
            payload: {
                room: {
                    name: this.name,
                    private: this.priv,
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
    removePlayer(playerId: string) {
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
    setGame(gameObj) {
        this.game = gameObj;
    }
    
    //set time control for the room
    setTime(timeObj) {
        if(!timeObj.increment || !timeObj.value) {
            return false;
        }
        this.time = timeObj;
        return true;
    }
    
    emitMessage(messageObj) {
        this.addMessage(messageObj);
        this.io.to(messageObj.thread).emit('action', {
            type: 'receive-message',
            payload: messageObj
        });
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
        return this.game.getGameType;
    }
    
    //check to see if the game is ready to begin
    gameReady() {
        return this.game.gameReady();
    }
    
    //begin the game
    startGame() {
        
        //Notify all players that the game is ready to be played
        const notificationOpts = {
            title: 'The game has begun',
            message: '',
            position: 'tr',
            autoDismiss: 3,
        };
        
        this.io.to(this.name).emit('action', Notifications.warning(notificationOpts));
        
        this.io.to(this.name).emit('action', {
            type: 'game-started',
            payload: {
                thread: this.name,
                room: this.getRoom()
            }
        })
    }
    
    formatTurn (turn) {
        switch (turn) {
            case 'w':
                return 'white';
            case 'b':
                return 'black';
            case 'g':
                return 'gold';
            case 'r':
                return 'red';
        }
        return false;
    }
}