const Engine = require('./Engine.js');
const {ab2str} = require('../server/utils/utils');

module.exports = class TwoEngine extends Engine {
    constructor(path, roomName, socket) {
        super(path, roomName, socket);
        this.setDepth(12);
    }
    onBestMove(data) {
        var str = ab2str(data);
        if (str.indexOf("uciok") !== -1) {
            this.setupOptions();
        }
        if(str.indexOf("bestmove") !== -1) {
            let startIndex = str.indexOf("bestmove");
            let from = str.substring(startIndex + 9, startIndex + 11);
            let to = str.substring(startIndex + 11, startIndex + 13);
            if (from.indexOf('@') !== -1) {
                from = '@';
            }
            let compMove = {
                to: to,
                from: from,
                promotion: 'q'
            };

            this.socket.emit('action', {
                type: 'server/new-move',
                payload: {
                    thread: this.roomName,
                    move: compMove
                }
            });
        }
    }
    
    setupOptions() {
        this.setOption("UCI_Variant", "crazyhouse");
    }
    
    setPosition(fen) {
        this.engine.stdin.write(
            "position fen " + fen + "\n"
        );
    }
    
    setTurn(turnColor) {
        console.log("set turn on CrazyEngine");
    }
    
    setOut(colorOut) {
        this.engine.stdin.write("stop");
    }
    
    adjustDepth(timeLeft) {
        let depth = this.depth;
		return depth;
    }
}