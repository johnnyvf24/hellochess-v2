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
    io: Object;
    numPlayers: number;
    gameType: string;
    gameRulesObj: any;
    timeControl: any;
    times: any;
    protected _lastMove: any;
    protected _lastTurn: string;
    protected _currentTurn: string;
    
    abstract addPlayer(player: Player, color: string): boolean;
    abstract removePlayer(color: string): boolean;
    abstract getGame(): any;
    abstract gameReady(): boolean;
    abstract outColor(): string;
    abstract newEngineInstance(roomName: string, io: any): void;
    
    setColorTime(color: string, time: number): void {
        this.times[color] = time;
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
    
    prevPlayerTime(): number {
        return this.times[this.lastTurn];
    }
    
    engineGo() {
        this.engineInstance.setPosition(this.gameRulesObj.fen());
        this.engineInstance.go(this.currentTurnTime(), 5);
    }
    
    currentTurnPlayer() {
        switch (this._currentTurn) {
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
    
    currentTurnTime() {
        return this.times[this._currentTurn];
    }
    
    makeMove(move: any): void {
        this._lastTurn = this.gameRulesObj.turn();
        this.gameRulesObj.move(move);
        this._lastMove = move;
        this._currentTurn = this.gameRulesObj.turn();
        // if the next player is an AI, start the engine
        if (this.currentTurnPlayer() instanceof AI) {
            this.engineGo();
        }
    }
    
}

export default Game;