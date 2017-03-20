const Engine = require('./Engine.js');
const {ab2str} = require('../server/utils/utils');

module.exports = class TwoEngine extends Engine {
    constructor(path, roomName, socket, increment) {
        super(path, roomName, socket);
        this.setDepth(15);
        this.increment = increment * 1000; // s -> ms
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
        this.setOption("Move Overhead", "300");
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
    
    go(timeLeft, level) {
        this.timeLeft = timeLeft;
        if (level) {
            console.log("setting comp skill level to", level);
            this.setOption("Skill Level", "" + level);
        }
        let timeString;
        if (timeLeft) {
            timeString = " wtime "+timeLeft+" btime "+timeLeft+" ";
            timeString += "winc "+this.increment+" binc "+this.increment+" ";
        } else {
            timeString = "";
        }
        let goString;
        if(this.mode == 0) {
            goString = "go" + timeString + "\n";
            console.log("[engine: "+this.roomName+"]", goString);
            this.engine.stdin.write(goString);
        } else {
            goString = "go " + "depth 4" + "\n";
            this.engine.stdin.write(goString);
        }
        
    }
}