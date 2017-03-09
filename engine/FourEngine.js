const Engine = require('./Engine.js');
const {ab2str} = require('../server/utils/utils');

module.exports = class FourEngine extends Engine {
    constructor(path, roomName, socket) {
        super(path, roomName, socket);
        this.setDepth(6);
    }
    onBestMove(data) {
        var str = ab2str(data);
        if(str.indexOf("bestmove") !== -1) {

            let compMove = {
                to: str.substr(str.indexOf("bestmove") + 9, str.length).split('-')[1].replace('\n', ''),
                from: str.substr(str.indexOf("bestmove") + 9, str.length).split('-')[0],
                promotion: 'q'
            };

            this.socket.emit('action', {
                type: 'server/four-new-move',
                payload: {
                    thread: this.roomName,
                    move: compMove
                }
            });
        }
    }
    
    setPosition(fen) {
        this.engine.stdin.write(
            "position fen " + fen.split('-')[0] + "\n"
        );
    }
    
    setTurn(turnColor) {
        let turn = this.colorToTurnNumber(turnColor);
        this.engine.stdin.write("turn "+ turn + "\n");
    }
    
    setOut(colorOut) {
        let out = this.colorToTurnNumber(colorOut);
        this.engine.stdin.write("out " + out + "\n");
        this.numOut += 1;
    }
    
    adjustDepth(timeLeft) {
        let depth = this.depth;
        if (timeLeft < 1000) { // 1 second
            depth = 1;
        } else if (timeLeft < 2000) { // 2 seconds
            depth = 2;
        } else if (timeLeft < 3000) { // 3 seconds
            depth = 3;
        } else if (timeLeft < 10000) { // 10 seconds
            depth = 4;
        } else if (timeLeft < 60000) { // 1 min
            depth = 5;
        }
		return depth;
    }
}
