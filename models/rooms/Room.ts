const Notifications = require('react-notification-system-redux');
import Connection from '../../server/sockets/Connection';
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
    private timer: any = null;
    
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
    
    //initialize the timers
    startTimer() {
        
        if(!this._name) {
            return;
        }
        
        if(!this.game) {
            return;
        }
        
        if(this.timer) {
           clearTimeout(this.timer); 
        }
        
        //get players turn
        let turn = this.game.getTurn();
        
        //get when the last move was made
        let lastMoveTime = this.game.lastMoveTime;
        
        //get how much time has passed
        let timeElapsed = Date.now() - lastMoveTime;
        
        if(!this.game.times) {
            return;
        }
        
        //calculate how much time the current player has left
        let timeLeft = this.game.times[turn];
        let time = timeLeft - timeElapsed;
        
        //start timing this person to check if they flag
        this.timer = setTimeout(function() {
            if(!this._name || !this.game) {
                return;
            }
            
            //get the player that lost and remove them from the game
            let loser = this.game.getPlayer(turn);
            if(!loser) return;
            this.game.setPlayerOutByColor(turn);
            
            //Notify all players that a player has lost on time
            let notificationOpts = {
                title: `${loser.username} has lost on time!`,
                position: 'tr',
                autoDismiss: 5,
            };
            this.io.to(this._name).emit('action', Notifications.info(notificationOpts));
            
            //Check to see if the game has ended
            if(this.game.gameOver()) {
                this.game.endAndSaveGame();
                
                //Notify all players that the game is over
                let notificationOpts = {
                    title: `${this._name}'s game is over`,
                    position: 'tr',
                    autoDismiss: 5,
                };
                this.io.to(this._name).emit('action', Notifications.success(notificationOpts));
                
                //set the next turn (for asythetic purposes)
                this.game.setNextTurn();
                
                //sync the room again
                this.io.to(this.name).emit('update-room', this.getRoom());
            } else {
                //set the next turn
                this.game.setNextTurn();
                
                // if white is an AI, start the engine
                if (this.game.currentTurnPlayer() instanceof AI) {
                    this.game.engineGo();
                }
                
                //sync the room again
                this.io.to(this.name).emit('update-room', this.getRoom());
                
                //start the next players timer
                this.startTimer();
            }
            
        }.bind(this), timeLeft);
    }
    
    //begin the game
    startGame(connection: Connection) {
        //Notify all players that the game is ready to be played
        const notificationOpts = {
            title: 'The game has begun',
            message: '',
            position: 'tr',
            autoDismiss: 3,
        };
        this.io.to(this._name).emit('action', Notifications.warning(notificationOpts));
        
        // if there are any AI players, add an engine instance to the game
        this._game.newEngineInstance(this._name, connection);
        
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
        this.game.startGame();
        this.startTimer();
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
        this._game.makeMove(move, this.time.increment);
        
        clearTimeout(this.timer);
        this.startTimer();
        this.io.to(this.name).emit('update-room', this.getRoom());
        
        // // if it's a legal move, emit to other players
        // let thread: string = this._name;
        // let fen: string = this._game.fen;
        // let lastTurn: string = this._game.lastTurn;
        // lastTurn = Game.COLOR_SHORT_TO_LONG[lastTurn];
        // let turn: string = this._game.currentTurn;
        // let time: number = this._game.prevPlayerTime();
        // let outColor: string = this._game.outColor();
        // let message: any = {
        //     thread: thread,
        //     fen: fen,
        //     lastTurn: lastTurn,
        //     turn: turn,
        //     time: time,
        //     move: move,
        //     outColor: outColor
        // };
        // console.log("four-new-move:", message);
        // this.sendNewMove(message);
    }
    
    makeEngineMove(move) {
        
    }
    
    clearTimer() {
        clearTimeout(this.timer);
    }
}