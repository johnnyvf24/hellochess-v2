import Player from '../players/Player';

abstract class Game {
    io: Object;
    numPlayers: number;
    gameType: string;
    gameRulesObj: any;
    times: Object;
    lastMove: any;
    
    abstract move(): any;
    abstract addPlayer(player: Player, color: string): boolean;
    abstract removePlayer(color: string): boolean;
    abstract getGame(): any;
    abstract gameReady(): boolean;
    abstract startGame(): any;
    abstract getTurn(): string;
    abstract setNextTurn(): void;
    abstract setPlayerOutByColor(color: string): void;
    abstract gameOver(): boolean;
    abstract endAndSaveGame(): boolean;
    
    setColorTime(color: string, time: number): void {
        this.times[color] = time;
    }
    
    setLastMove() {
        this.lastMove = Date.now();
    }
    
    removeColorTime(color: string): void {
        this.times[color] = 0;
    }
    
    getColorTime(color: string): number {
        return this.times[color];
    }
}

export default Game;