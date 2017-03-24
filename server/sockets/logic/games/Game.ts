import Player from '../players/Player';

interface Game {
    io: Object;
    numPlayers: number;
    gameType: string;
    gameRulesObj: object;
    
    move(): any;
    addPlayer(player: Player, color: string): boolean;
}

export default Game;