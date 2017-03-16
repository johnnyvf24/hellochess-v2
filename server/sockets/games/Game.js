

module.exports = class Game {
    constructor(numPlayers, gameType, gameRulesObj) {
        this.numPlayers = numPlayers;
        this.gameType = gameType;
        this.gameRulesObj = gameRulesObj;
    }
    
    getNumberOfPlayers() {
        return this.numPlayers;
    }
    
    getGameType() {
        return this.gameType;
    }
}