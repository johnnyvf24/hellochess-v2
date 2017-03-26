import Player from '../players/Player';

interface Game {
    io: Object;
    numPlayers: number;
    gameType: string;
    gameRulesObj: any;
    
    move(): any;
    addPlayer(player: Player, color: string): boolean;
    getGame(): any;
}

export default Game;