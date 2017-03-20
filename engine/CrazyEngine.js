const Engine = require('./Engine.js');
const {ab2str} = require('../server/utils/utils');

module.exports = class TwoEngine extends Engine {
    constructor(path, roomName, socket) {
        super(path, roomName, socket);
        this.setDepth(15);
    }
    onBestMove(data) {
        var str = ab2str(data);
        if (str.indexOf("uciok") !== -1) {
            this.setupOptions();
        }
        console.log("[crazyhouse engine: " + this.roomName+ "] " + str);
        if(str.indexOf("bestmove") !== -1) {
            let startIndex = str.indexOf("bestmove");
            let from = str.substring(startIndex + 9, startIndex + 11);
            let to = str.substring(startIndex + 11, startIndex + 13);
            let compMove = {};
            if (from.indexOf('@') !== -1) {
                let piece = from.charAt(0).toLowerCase();
                from = '@';
                compMove.piece = piece;
            }
            if (str.substring(startIndex + 13, startIndex + 14) === '=') {
                compMove.promotion = str.substring(startIndex + 14, startIndex + 15);
            } else {
                compMove.promotion = 'q';
            }
            compMove.to = to;
            compMove.from = from;
            console.log("[crazyhouse engine: " + this.roomName + "]", compMove);

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
        this.setOption("Skill Level", "7");
        this.setOption("Contempt", "100");
        this.setOption("Move Overhead", "300");
        //this.setOption("Slow Mover", "600");
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