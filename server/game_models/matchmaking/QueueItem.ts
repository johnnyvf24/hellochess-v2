import Player from '../players/Player';

export default class QueueItem {

    constructor( 
        private _player: Player, 
        private _gameType: string,
        private _timeControl: number, 
        private _timeIncrement: number){}
        
    print() {
        return {
            player: this._player.username,
            gameType: this._gameType,
            timeControl: this._timeControl,
            timeIncrement: this._timeIncrement,
        }
    }
    
    get player(): Player {
        return this._player;
    }
    
    get gameType(): string {
        return this._gameType;
    }
    
    get timeControl(): number {
        return this._timeControl;
    }
    
    get timeIncrement(): number {
        return this._timeIncrement;
    }
    
}