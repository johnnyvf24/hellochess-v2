import Engine from './Engine';
const {ab2str} = require('../server/utils/utils');

export default class TwoEngine extends Engine {
    constructor(roomName, socket, increment) {
        super('./engine/bin/stockfish_variant', roomName, socket);
        this.setDepth(15);
        this.increment = increment * 1000; // s -> ms
    }
    onBestMove(data) {
        var str = ab2str(data);
        if (str.indexOf("uciok") !== -1) {
            this.setupOptions();
        }
        if(str.indexOf("bestmove") !== -1) {
            console.log("[crazyhouse engine: " + this.roomName+ "] " + str);
            let startIndex = str.indexOf("bestmove");
            let from = str.substring(startIndex + 9, startIndex + 11);
            let to = str.substring(startIndex + 11, startIndex + 13);
            let compMove: any = {};
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
        this.setOption("UCI_Variant", "crazyhouse");
        this.setOption("Skill Level", "7");
        this.setOption("Contempt", "100");
        this.setOption("Move Overhead", "300");
        //this.setOption("Slow Mover", "600");
    }
    
    set960() {
        this.setOption("UCI_Chess960", "true");
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