export default class Player {

    constructor( 
        private _socket: any, 
        private _playerId: string, 
        private _username: string, 
        private _picture: string) {
    }
    
    getPlayer(): any {
        return {
            username: this._username,
            playerId: this._playerId,
            picture: this._picture
        }
    }
    
    emitMessage() {
        
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