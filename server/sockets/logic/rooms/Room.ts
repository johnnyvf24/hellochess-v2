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
            messages: this.getAllMessages(),
            time: this._time,
            game: this._game
        }
    }
    
    getAllMessages() {
        let mess = [];
        this._messages.map(message => {
            mess.push(message.getMessage()); 
        });
        
        return mess;
    }
    
    addPlayer(playerObj: Player) {
        playerObj.socket.join(this._name);
        
        this._players.push(playerObj);
        let joinMsg: Message = new Message(playerObj, null, this._name);
        joinMsg.setToJoinMessage();
        
        this.addMessage(joinMsg);
        
        playerObj.socket.emit('joined-room', this.getRoom());
        
        //Tell everyone in the room that a new user has connnected
        this.io.to(this._name).emit('user-room-left', {
            name: this._name,
            user: playerObj.getPlayer(),
            message: joinMsg.getMessage()
        });
        
        return true;
    }
    
    //Remove a player from the room;
    removePlayer(playerThatLeft: Player) {
        let foundPlayer = false;
        this._players = this._players.filter((player) => {
            if(player.playerId !== playerThatLeft.playerId) {
                return player;
            } else {
                let leftMsg: Message = new Message(playerThatLeft, null, this._name);
                leftMsg.setToLeaveMessage();
                this.addMessage(leftMsg);
                playerThatLeft.socket.leave(this._name);
                playerThatLeft.socket.emit('left-room', this._name);
                foundPlayer = true;
                //Tell everyone in a room that a user has left
                this.io.to(this._name).emit('user-room-left', {
                    name: this._name,
                    user: player.getPlayer(),
                    message: leftMsg.getMessage()
                });
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
    addMessage(message: Message) {
        this._messages.push(message);
        
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
    
    get name() {
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