import Game from './Game';
const {Crazyhouse} = require('crazyhouse.js');
import Player from '../players/Player';

export class CrazyHouse implements Game {
    gameType: string = 'crazyhouse';
    gameRulesObj: Object = new Crazyhouse();
    numPlayers: number = 2;
    io: Object;
    
    constructor(io: Object) {
        this.io = io;
    }
    
    
    move() {
        
    }
    
    addPlayer(player: Player, color: string) {
        return false;
    }
}