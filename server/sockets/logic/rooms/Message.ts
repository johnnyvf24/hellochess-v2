import Player from '../players/Player';

export default class Message {
    private _picture: string;
    private _username: string;
    private _eventType: string = null;
    
    constructor(player: Player, 
                private _message: string,
                private _thread: string) {
        this._picture = player.picture;
        this._username = player.username;
    }
    
    getMessage() {
        return {
            user: this._username,
            msg: this._message,
            picture: this._picture,
            event_type: this._eventType
        };
    }
    
    setToJoinMessage() {
        let leftMessage = `${this._username} has joined the room.`;
        this._message = leftMessage;
        this._eventType = 'user-joined';
    }
    
    setToLeaveMessage() {
        let leftMessage = `${this._username} has left the room.`;
        this._message = leftMessage;
        this._eventType = 'user-left';
    }
}