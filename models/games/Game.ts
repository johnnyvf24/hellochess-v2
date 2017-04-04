const Notifications = require('react-notification-system-redux');
import Player from '../players/Player';
import Engine from '../../engine/Engine';
import AI from '../players/AI';

abstract class Game {
    public static COLOR_SHORT_TO_LONG: any =
        {
            'w': 'white',
            'b': 'black',
            'r': 'red',
            'g': 'gold'
        };
    public static COLOR_LONG_TO_SHORT: any =
        {
            'white': 'w',
            'black': 'b',
            'red': 'r',
            'gold': 'g'
        };
    public white: Player = null;
    public black: Player = null;
    public gold: Player = null;
    public red: Player = null;
    engineInstance: Engine;
    io: any;
    numPlayers: number;
    gameType: string;
    gameRulesObj: any;
    timeControl: any;
    times: any;
    _lastMove: any;
    _lastMoveTime: any;
    _lastTurn: string;
    _currentTurn: string;
    gameStarted: boolean = false;
    roomName: string;
    
    abstract addPlayer(player: Player, color: string): boolean;
    abstract removePlayer(color: string): boolean;
    abstract getGame(): any;
    abstract gameReady(): boolean;
    abstract outColor(): string;
    abstract newEngineInstance(roomName: string, io: any): void;
    abstract startGame(): any;
    
    setColorTime(color: string, time: number): void {
        this.times[color] = time;
    }
    
    get lastMoveTime() {
        return this._lastMoveTime;
    }
    
    set lastMoveTime(time) {
        this._lastMoveTime = time;
    }
    
    get lastMove() {
        return this._lastMove;
    }
    
    set lastMove(move) {
        this._lastMove = move;
    }
    
    removeColorTime(color: string): void {
        this.times[color] = 0;
    }
    
    getColorTime(color: string): number {
        return this.times[color];
    }
    
    get fen(): string {
        return this.gameRulesObj.fen();
    }
    
    get lastTurn(): string {
        return this._lastTurn;
    }
    
    get currentTurn(): string {
        return this._currentTurn;
    }
    
    getTurn(): string {
        return this.gameRulesObj.turn();
    }
    
    setNextTurn(): void {
        this.gameRulesObj.nextTurn();
    }
    
    prevPlayerTime(): number {
        return this.times[this.lastTurn];
    }
    
    engineGo() {
        this.engineInstance.setPosition(this.gameRulesObj.fen());
        this.engineInstance.setTurn(this.gameRulesObj.turn());
        let playerTimeLeft = this.currentTurnTime();
        let currentPlayer = this.currentTurnPlayer();
        if(playerTimeLeft && currentPlayer.playerLevel) {
            this.engineInstance.go(playerTimeLeft, currentPlayer.playerLevel);
        }
    }
    
    killEngineInstance() {
        if(this.engineInstance) {
            this.engineInstance.kill();
        }
    }
    
    currentTurnPlayer(): Player {
        switch (this.gameRulesObj.turn()) {
            case 'w':
                return this.white;
            case 'b':
                return this.black;
            case 'g':
                return this.gold;
            case 'r':
                return this.red;
            default:
                return null;
        }
    }
    
    setPlayerOutByColor(color: string) {
        let playerOut = null;
        switch(color.charAt(0)) {
            case 'w':
                this.white.alive = false;
                playerOut = this.white;
                this.times.w = 1;
                this.gameRulesObj.setWhiteOut();
                break;
            case 'b':
                this.black.alive = false;
                playerOut = this.black;
                this.times.b = 1;
                this.gameRulesObj.setBlackOut();
                break;
            case 'g':
                this.gold.alive = false;
                playerOut = this.gold;
                this.times.g = 1;
                this.gameRulesObj.setGoldOut();
                break;
            case 'r':
                this.gameRulesObj.setRedOut();
                this.red.alive = false;
                playerOut = this.red;
                this.times.r = 1;
                break;
        }
        if(playerOut) {
            const notificationOpts = {
                title: 'Player Elimination',
                message: `${playerOut.username} has been eliminated!`,
                position: 'tr',
                autoDismiss: 5,
            };
            if(this.roomName) {
                this.io.to(this.roomName).emit('action', Notifications.info(notificationOpts));
            }
            
        }
    }
    
    currentTurnTime() {
        return this.times[this.gameRulesObj.turn()];
    }
    
    makeMove(move: any, increment: number): void {
        this._lastTurn = this.gameRulesObj.turn();
        this.gameRulesObj.move(move);
        
        if(move == null) {
            return;
        } else  { //the move was valid
            if(move.color) { // A player was eliminated
                this.setPlayerOutByColor(move.color);
            }
            
            if(this.gameRulesObj.inCheckMate()) { //this player is in checkmate
                if(this.roomName) {
                    let currentPlayer = this.currentTurnPlayer();
                    
                    const notificationOpts = {
                        title: 'Checkmate',
                        message: `A player is in checkmate! ${currentPlayer.username}'s turn has been skipped.`,
                        position: 'tr',
                        autoDismiss: 5,
                    };
                    
                    this.io.to(this.roomName).emit('action', Notifications.warning(notificationOpts));
                }
                this.gameRulesObj.nextTurn();
            }
        }
        
        //set the last move made
        this._lastMove = move;
        
        //calculate the time difference between the last move
        let timeElapsed = Date.now() - this.lastMoveTime;
        this.lastMoveTime = Date.now();
        
        //calculate the time increment and add it to the current players time
        let timeIncrement = increment * 1000;
        this.setColorTime(this._lastTurn, this.times[this._lastTurn] - timeElapsed + timeIncrement);
        
        //check to see if the game is over
        if (this.gameRulesObj.game_over()) {
    
            if (this.gameRulesObj.in_draw()) {
    
            } else {
                return;
            }
        }
        
        this._currentTurn = this.gameRulesObj.turn();
        // if the next player is an AI, start the engine
        if (this.currentTurnPlayer() instanceof AI) {
            setTimeout(() => this.engineGo(), 100); // add a small delay between AI's moving
        }
    }
    
    gameOver(): boolean {
        return this.gameRulesObj.game_over();
    }
    
}

export default Game;