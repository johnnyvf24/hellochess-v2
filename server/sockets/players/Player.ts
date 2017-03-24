export default class Player {
    private username: string;
    private _id: string;
    private picture: string;
    constructor(private socket: any) {
        
    }
    
    setPlayerAttributes(playerData: any): boolean {
        if( !playerData.username 
            || !playerData._id 
            || !playerData.picture) {
            return false;
        }
        
        this.username = playerData.username;
        this._id = playerData._id;
        this.picture = playerData.picture;
        return true;
    }
    
    getPlayerAttributes() {
        return {
            username: this.username,
            _id: this.id,
            picture: this.picture
        }
    }
    
    getSocket() {
        return this.socket;
    }
    
    getUsername() {
        return this.username;
    }
    
    getPicture() {
        return this.picture;
    }
    
    get id(): string {
        return this._id;
    }
    
    set id(id: string) {
        this._id = id;
    }
}