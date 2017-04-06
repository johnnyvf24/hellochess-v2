import Ratings from '../ratings/Ratings';

export default class Player {
    private _type: string = 'human'; //default player will be human
    private _alive: boolean = false;
    private _playerLevel: number;

    constructor( 
        public _socket: any, 
        private _playerId: string, 
        private _username: string, 
        private _picture: string,
        private _social: boolean,
        private _email: string,
        private _standard_ratings: Ratings,
        private _fourplayer_ratings: Ratings,
        private _crazyhouse_ratings: Ratings,
        private _crazyhouse960_ratings: Ratings) {
    }
    
    get standard_ratings(): Ratings { return this._standard_ratings; }
    get fourplayer_ratings(): Ratings { return this._fourplayer_ratings; }
    get crazyhouse_ratings(): Ratings { return this._crazyhouse_ratings; }
    get crazyhouse960_ratings(): Ratings { return this._crazyhouse960_ratings; }
    get alive(): boolean { return this._alive; }
    get playerLevel(): number { return this._playerLevel; }
    
    set standard_ratings(ratings: Ratings) { this._standard_ratings = ratings; }
    set fourplayer_ratings(ratings: Ratings) { this._fourplayer_ratings = ratings; }
    set crazyhouse_ratings(ratings: Ratings) { this._crazyhouse_ratings = ratings; }
    set crazyhouse960_ratings(ratings: Ratings) { this._crazyhouse960_ratings = ratings; }
    set alive(alive: boolean) { this._alive = alive; }
    set playerLevel(num: number) { this._playerLevel = num; }
    
    getPlayer(): any {
        return {
            username: this._username,
            playerId: this._playerId,
            picture: this._picture,
            standard_ratings: this._standard_ratings,
            fourplayer_ratings: this._fourplayer_ratings,
            crazyhouse_ratings: this._crazyhouse_ratings,
            crazyhouse960_ratings: this._crazyhouse960_ratings,
            alive: this._alive,
            level: this._playerLevel,
            type: this._type
        };
    }
    
    emitMessage() {
        
    }
    
    get picture(): string {
        return this._picture;
    }
    
    get type(): string {
        return this._type;
    }
    
    set type(type: string) {
        this._type = type;
    }
    
    get socket() {
        return this._socket;
    }
    
    get username(): string {
        return this._username;
    }
    
    set username(username: string) {
        if(username.length > 3) {
            this._username = username;
        }
    }
    
    get playerId(): string {
        return this._playerId;
    }
    
    set playerId(id: string) {
        this._playerId = id;
    }
}