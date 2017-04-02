const Notifications = require('react-notification-system-redux');
import Player from '../players/Player';
import AI from '../players/AI';
import Game from '../games/Game';
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
    private gameStartAction: string;
    private newMoveAction: string;
    
    static numRooms: number = 0;
    
    constructor(private io: any, private _game: Game) {
        this._messages = []; //a list of all the messages stored for that room
        this._players = []; //a list of all players in the room
        Room.numRooms++;
        this._id = Room.numRooms;
        // set up the action string depending on game type
        switch (this.getGameType()) {
            case "four-player":
                this.gameStartAction = "four-game-started";
                this.newMoveAction = "four-new-move";
                break;
            case "standard":
            case "crazyhouse":
            case "crazyhouse960":
            default:
                this.gameStartAction = "game-started";
                this.newMoveAction = "new-move";
                break;
        }
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
        let game;
        if(this._game) {
                game = this._game.getGame();
            return {
                id: this._id,
                room: {
                    name: this._name,
                    private: this._priv,
                    voiceChat: this._voiceChat,
                    maxPlayers: this._maxPlayers
                },
                gameType: this._game.gameType,
                users: this.getAllRoomPlayersWithoutSockets(),
                messages: this.getAllMessages(),
                time: this._time,
                times: this._game.times,
                game: game
            };
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
        
        //Tell everyone in the room that a new user has connnected
        this.io.to(this.name).emit('update-room', this.getRoom());
        
        return true;
    }
    
    empty(): boolean {
        if(this._players.length == 0 ) {
            return true;
        }
        return false;
    }
    
    //Remove a player from the room;
    removePlayer(playerThatLeft: Player) {
        if(!playerThatLeft) {
            return false;
        }
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
    set game(gameObj) {
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
    isPlayerInRoom(player: Player) {
        let playerFound = false;
        this._players.map((player) => {
            if(player.playerId === player.playerId) {
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
    
    get game() {
        return this._game;
    }
    
    getGameType() {
        return this._game.gameType;
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
        
        // if there are any AI players, add an engine instance to the game
        this._game.newEngineInstance(this._name, this.io);
        
        let roomObj: any = this.getRoom();
        this.io.to(this._name).emit(this.gameStartAction,
            {
                thread: this._name,
                room: roomObj
            }
        );
        
        // if white is an AI, start the engine
        if (this._game.white instanceof AI) {
            this._game.engineGo();
        }
    }
    
    endGame() {
        // pause the game
        this.io.to(this._name).emit('pause', {thread: this._name});
        
    }
    
    sendNewMove(message: any): void {
        this.io.to(this._name).emit(this.newMoveAction, message);
    }
    
    makeMove(move: any): void {
        // make the move in the game logic
        this._game.makeMove(move);
        // if it's a legal move, emit to other players
        let thread: string = this._name;
        let fen: string = this._game.fen;
        let lastTurn: string = this._game.lastTurn;
        lastTurn = Game.COLOR_SHORT_TO_LONG[lastTurn];
        let turn: string = this._game.currentTurn;
        let time: number = this._game.prevPlayerTime();
        let outColor: string = this._game.outColor();
        let message: any = {
            thread: thread,
            fen: fen,
            lastTurn: lastTurn,
            turn: turn,
            time: time,
            move: move,
            outColor: outColor
        };
        console.log("four-new-move:", message);
        this.sendNewMove(message);
    }
    
    makeEngineMove(move) {
        
    }
}