import Engine from './Engine';
const {ab2str} = require('../utils/utils');

import Room from '../game_models/rooms/Room';
import Connection from '../sockets/Connection';
import Game from '../game_models/games/Game';

export default class SChessEngine extends Engine {
    private setOptions: boolean = false;
    private firstRun: boolean = true;
    constructor(roomName, increment, connection) {
        super('Sigla_v2.1.exe', roomName, connection, true);
        this.increment = increment * 1000; // s -> ms
    }
    onBestMove(data) {
        var str = ab2str(data);
        if (str.indexOf("# White virgin squares:") !== -1 ) {
            this.setupOptions();
        }
        if(str.indexOf("bestMove") !== -1) {
            // move format: e2e3
            let startIndex = str.indexOf("bestMove") + 9;
            let from = str.substring(startIndex, startIndex + 2);
            let to = str.substring(startIndex + 2, startIndex + 4);
            let dock = str.charAt(startIndex + 4);
            let compMove = null;
            if(from.charAt(1) === '7' && to.charAt(1) === '8' && dock.match(/[a-z]/i)) {
                compMove = {
                    to: to,
                    from: from,
                    promotion: dock,
                };
            }
            else if(from.charAt(1) === '2' && to.charAt(1) === '1' && dock.match(/[a-z]/i)) {
                compMove = {
                    to: to,
                    from: from,
                    promotion: dock,
                };
            }
            else if(dock === 'h' || dock === 'e') {
                compMove = {
                    to: to,
                    from: from,
                    s_piece: dock,
                };
            } else {
                compMove = {
                    to: to,
                    from: from,
                };
            }
            
            console.log(compMove);
            
            let roomName = this.roomName;
            let room: Room = this.connection.getRoomByName(roomName);
            if(!room) {
                return;
            }
            let game: Game = room.game;
            let move = data.move;
            room.makeMove(compMove, Date.now());
        }
    }
    
    setupOptions() {
        if(this.setOptions === false) {
            this.setWinboardTime(5);
            this.setOptions = true;
        }
    }
    
    // Should re-arange the fen string into a format the engine 
    // can understand
    parseGameFenToEngineFormat(fen) {
        let tokenizedString = fen.split(' ');
        let position = tokenizedString[0];
        let virginSquares = tokenizedString[1];
        let elephantHawk = tokenizedString[2];
        let turn = tokenizedString[3];
        let castlingAvail = tokenizedString[4];
        
        // Parse castling to engine
        let wK = '';
        let bK = '';
        let wQ = '';
        let bQ = '';
        if(castlingAvail.indexOf('K') > -1) {
            wK = 'K';
        }
        if(castlingAvail.indexOf('k') > -1) {
            bK = 'k';
        }
        if(castlingAvail.indexOf('Q') > -1) {
            wQ = 'Q';
        }
        if(castlingAvail.indexOf('q') > -1) {
            bQ = 'q';
        }
        
        //Parse the virgin squares to engine format
        let newVirginSquares = '';
        
        // White virgin squares
        newVirginSquares += virginSquares.charAt(6) + virginSquares.charAt(5) + virginSquares.charAt(3)
                    + virginSquares.charAt(2) + virginSquares.charAt(1);
        // Black virgin squares
        newVirginSquares += virginSquares.charAt(14) + virginSquares.charAt(13) + virginSquares.charAt(11)
                    + virginSquares.charAt(10) + virginSquares.charAt(9);
        console.log('Virgin squares before parse ', newVirginSquares);
        
        let orderVirginSquares = ['G', 'F', 'D', 'C', 'B'];
        
        let str = wK;
        for(let i = 0; i < orderVirginSquares.length; i++) {
            if( newVirginSquares.charAt(i) !== 'x' && 
                newVirginSquares.charAt(i) !== 'X') {
                str += orderVirginSquares[i];
            }
        }
        
        str += wQ + bK;
        
        orderVirginSquares = ['g', 'f', 'd', 'c', 'b'];
        
        for(let i = 0; i < orderVirginSquares.length; i++) {
            if( newVirginSquares.charAt(i) !== 'x' && 
                newVirginSquares.charAt(i) !== 'X') {
                str += orderVirginSquares[i];
            }
        }
        
        newVirginSquares = str + bQ;
        
        /* Fix the order of the pieces that have yet to dock */
        let newEleHawk = '';
        if (elephantHawk.indexOf('H') > -1) {
            newEleHawk += 'H';
        }
        if (elephantHawk.indexOf('E') > -1) {
            newEleHawk += 'E';
        }
        if (elephantHawk.indexOf('h') > -1) {
            newEleHawk += 'h';
        }
        if (elephantHawk.indexOf('e') > -1) {
            newEleHawk += 'e';
        }
        
        //Final string engine can understand
        return `${position}[${newEleHawk}] ${turn} ${newVirginSquares} -`;
    }
    
    setPosition(fen) {
        console.log('before FEN ', fen);
        fen = this.parseGameFenToEngineFormat(fen);
        console.log('after FEN ', fen);
        if(this.engine) {
            this.engine.stdin.write(
                "setboard " + fen + "\n"
            );
        }
    }
    
    setOut(colorOut) {

    }
    
    setTurn() {
        
    }
    
    adjustDepth(timeLeft) {
        let depth = this.depth;
		return depth;
    }
    
    go(timeLeft: number, depth: number, engineMatch: boolean) {
        if(this.mode === 0 && (this.firstRun || engineMatch === true)) {
            if(this.engine) {
                this.engine.stdin.write('go' + "\n");
                this.firstRun = false;
            }
        }
        
    }
}