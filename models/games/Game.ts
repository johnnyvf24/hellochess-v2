import Player from '../players/Player';

abstract class Game {
    io: Object;
    numPlayers: number;
    gameType: string;
    gameRulesObj: any;
    times: Object;
    
    abstract move(): any;
    abstract addPlayer(player: Player, color: string): boolean;
    abstract removePlayer(color: string): boolean;
    abstract getGame(): any;
    abstract gameReady(): boolean;
    
    setColorTime(color: string, time: number): void {
        console.log("setting", color, "time to", time);
        this.times[color] = time;
    }
    
    removeColorTime(color: string): void {
        this.times[color] = 0;
    }
    
    getColorTime(color: string): number {
        return this.times[color];
    }
}

export default Game;