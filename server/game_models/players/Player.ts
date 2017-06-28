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
        public standard_ratings: Ratings,
        public schess_ratings: Ratings,
        public fourplayer_ratings: Ratings,
        public crazyhouse_ratings: Ratings,
        public crazyhouse960_ratings: Ratings,
        public fullhouse_ratings: Ratings,
        private _IP: any) {
    }
    
    get alive(): boolean { return this._alive; }
    get playerLevel(): number { return this._playerLevel; }
    get ipaddress(): any { return this._IP; }
    
    set alive(alive: boolean) { this._alive = alive; }
    set playerLevel(num: number) { this._playerLevel = num; }
    
    getPlayer(): any {
        return {
            username: this._username,
            playerId: this._playerId,
            picture: this._picture,
            standard_ratings: this.standard_ratings,
            schess_ratings: this.schess_ratings,
            fourplayer_ratings: this.fourplayer_ratings,
            crazyhouse_ratings: this.crazyhouse_ratings,
            crazyhouse960_ratings: this.crazyhouse960_ratings,
            fullhouse_ratings: this.fullhouse_ratings,
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