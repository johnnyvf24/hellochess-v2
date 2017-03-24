const Notifications = require('react-notification-system-redux');
import Player from '../players/Player';
import Message from './Message';

export default class Room {
    private _players: Player [];
    private _messages: Message [];
    private _priv: boolean;
    private _id: number;
    private _voiceChat: boolean;
    private _maxPlayers: number;
    private _name: string;
    private _time: any;
    
    static numRooms: number = 0;
    
    constructor(private io: any, private _game: any) {
        this._messages = []; //a list of all the messages stored for that room
        this._players = []; //a list of all players in the room
        Room.numRooms++;
        this._id = Room.numRooms;
    }
    
    setRoomAttributes(roomObj: any): boolean {
        if( typeof roomObj.private == undefined
            || typeof roomObj.voiceChat == undefined 
            || typeof roomObj.maxPlayers == undefined
            || typeof roomObj.name == undefined) {
            return false;        
        }
        this._priv = roomObj.private;
        this._voiceChat = roomObj.voiceChat;
        this._maxPlayers = roomObj.maxPlayers;
        this._name = roomObj.name;
        return true;
    }
    
    getRoom(): Object {
        return {
            id: this._id,
            room: {
                name: this._name,
                private: this._priv,
                voiceChat: this._voiceChat,
                maxPlayers: this._maxPlayers
            },
            users: this.getAllRoomPlayersWithoutSockets(),
            messages: this._messages,
            time: this._time,
            game: this._game
        }
    }
    
    addPlayer(playerObj) {
        playerObj.socket.join(this._name);
        
        this._players.push(playerObj);
        let joinedMessage = `${playerObj.username} has joined the room.`;
        let msgObj = {
            user: playerObj.getPlayer(),
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
        
        let data = this.getRoom();
        
        playerObj.socket.emit('joined-room', data);
        return true;
    }
    
    //Remove a player from the room;
    removePlayer(playerId: string) {
        let foundPlayer = false;
        this._players = this._players.filter((player) => {
            if(player.playerId !== playerId) {
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
        this._players = this._players.filter((player) => {
            if(playerSocket.id !== player.socket.id) {
                return player;
            } else {
                foundPlayer = true;
            }
        })
        return foundPlayer;
    }
    
    //Add a game object to the room
    setGame(gameObj) {
        this._game = gameObj;
    }
    
    set time(timeObj: any) {
        this._time = timeObj;
    }
    
    get time() {
        return this._time;
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
        this._messages.push(messageObj);
    }
    
    //add all players in the room
    getAllRoomPlayers() {
        return this._players;
    }
    
    //checks to see if the player is in a specified room
    isPlayerInRoom(socket) {
        let playerFound = false;
        this._players.map((player) => {
            if(player.socket.id === socket.id) {
                playerFound = true;
            } 
        });
        
        return playerFound;
    }
    
    getAllRoomPlayersWithoutSockets() {
        let players = this._players;
        let newPlayersList = [];
        players.map((player) => {
            newPlayersList.push(player.getPlayer());
        });
        
        return newPlayersList;
    }
    
    getName() {
        return this._name;
    }
    
    getGame() {
        return this._game;
    }
    
    getGameType() {
        return this._game.getGameType;
    }
    
    //check to see if the game is ready to begin
    gameReady() {
        return this._game.gameReady();
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
        
        this.io.to(this._name).emit('action', Notifications.warning(notificationOpts));
        
        this.io.to(this._name).emit('action', {
            type: 'game-started',
            payload: {
                thread: this._name,
                room: this.getRoom()
            }
        })
    }
}