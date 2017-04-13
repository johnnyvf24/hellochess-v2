import Engine from './Engine';
const {ab2str} = require('../utils/utils');

import Room from '../game_models/rooms/Room';
import Connection from '../sockets/Connection';
import Game from '../game_models/games/Game';

export default class TwoEngine extends Engine {
    constructor(roomName, increment, connection) {
        super('stockfish_8_x64', roomName, connection);
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
            
            let roomName = this.roomName;
            let room: Room = this.connection.getRoomByName(roomName);
            if(!room) {
                return;
            }
            let game: Game = room.game;
            let move = data.move;
            room.makeMove(compMove);
        }
    }
    
    setupOptions() {
        this.setOption("Skill Level", "1");
        this.setOption("Contempt", "100");
        this.setOption("Move Overhead", "300");
    }
    
    setPosition(fen) {
        if(this.engine) {
            this.engine.stdin.write(
                "position fen " + fen + "\n"
            );
        }
    }
    
    setTurn(turnColor) {
        // console.log("set turn on TwoEngine");
    }
    
    setOut(colorOut) {
        if(this.engine) {
            this.engine.stdin.write("stop");
        }
    }
    
    adjustDepth(timeLeft) {
        let depth = this.depth;
		return depth;
    }
    
    go(timeLeft, level) {
        this.timeLeft = timeLeft;
        if (level) {
            // console.log("setting comp skill level to", level);
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
            // console.log("[engine: "+this.roomName+"]", goString);
            if(this.engine) {
                this.engine.stdin.write(goString);
            }
        } else {
            goString = "go " + "depth 4" + "\n";
            this.engine.stdin.write(goString);
        }
        
    }
}