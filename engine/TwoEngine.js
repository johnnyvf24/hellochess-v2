const Engine = require('./Engine.js');
const {ab2str} = require('../server/utils/utils');

module.exports = class TwoEngine extends Engine {
    constructor(path, roomName, io) {
        super(path, roomName, io);
        this.setDepth(15);
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
            let compMove = {
                to: to,
                from: from,
                promotion: 'q'
            };

            this.io.to(this.roomName).emit('action', {
                type: 'server/new-move',
                payload: {
                    thread: this.roomName,
                    move: compMove
                }
            });
        }
    }
    
    setupOptions() {
        this.setOption("Skill Level", "1");
        this.setOption("Contempt", "100");
        this.setOption("Slow Mover", "1000");
    }
    
    setPosition(fen) {
        this.engine.stdin.write(
            "position fen " + fen + "\n"
        );
    }
    
    setTurn(turnColor) {
        console.log("set turn on TwoEngine");
    }
    
    setOut(colorOut) {
        this.engine.stdin.write("stop");
    }
    
    adjustDepth(timeLeft) {
        let depth = this.depth;
		return depth;
    }
}