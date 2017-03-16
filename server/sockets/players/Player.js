module.exports = class Player {
    constructor(socket) {
        this.socket = socket;
    }
    
    setPlayerAttributes(playerObj) {
        if( !playerObj.username 
            || !playerObj._id 
            || !playerObj.picture) {
            return false;
        }
        
        this.username = playerObj.username;
        this.playerId = playerObj._id;
        this.picture = playerObj.picture;
        return true;
    }
    
    getPlayerAttributes() {
        return {
            username: this.username,
            _id: this.playerId,
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
    
    getPlayerId() {
        return this.playerId;
    }
}