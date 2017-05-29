let spawn = require('child_process').spawn;
const path = require('path');
const {ab2str} = require('../utils/utils');


abstract class Engine {
    public turn: string;
    public depth: number;
    protected engine: any;
    protected numOut;
    protected mode;
    protected timeLeft;
    protected increment;

    constructor(public executableName, public roomName, public connection, public windowsExe: Boolean) {
        this.roomName = roomName;
        this.connection = connection;
        
        let enginePath = path.join(__dirname, '../../executables/' + executableName);
        
        try {
            this.engine = spawn((windowsExe === true) ? 'wine': enginePath, (windowsExe === true) ? [enginePath] : []);
            this.engine.stdout.on('data', this.onBestMove.bind(this));
            this.engine.on('error', function(err) {
                console.log(err); 
            });
        } catch (err) {
            console.log(err);
        }
        
        this.numOut = 0;
        this.mode = 0;
        if (windowsExe === false) {this.sendUci();}
    }
    
    abstract go(timeLeft: number, depth: number, engineMatch: boolean): void;
    abstract adjustDepth(timeLeft: number, level: number): void;
    abstract onBestMove(data: any): void;
    abstract setPosition(fen): void;
    abstract setTurn(turnColor): void;
    abstract setOut(colorOut): void;

    setMode(mode) {
        this.mode = mode;
    }

    colorToTurnNumber(color) {
        if (!color)
            return '0';
        color = color.charAt(0);
        let turn;
        switch(color) {
            case 'w':
                turn = '0';
                break;
            case 'b':
                turn = '1';
                break;
            case 'g':
                turn = '2';
                break;
            case 'r':
                turn = '3';
                break;
            default:
                turn = '0';
        }
        return turn;
    }

    public setDepth(depth): void {
        this.depth = depth;
    }
    
    sendUci() {
        if(this.engine && this.engine.stdin) {
            this.engine.stdin.write("uci\n");
        }
    }
    
    setOption(name, value) {
        if(this.engine && this.engine.stdin) {
            this.engine.stdin.write(
                "setoption name " + name + " value " + value + "\n"
            );
        }
    }
    
    setWinboardForceMode() {
        if(this.engine && this.engine.stdin) {
            this.engine.stdin.write(
                "force\n"
            );
        }
    }
    
    //Set the time for search on winboard protocol (in seconds)
    setWinboardTime(time) {
        if(this.engine && this.engine.stdin) {
            this.engine.stdin.write(
                "st " + time + "\n"
            );
        }
    }
    
    setTurnWinboard(turn) {
        if(this.engine && this.engine.stdin) {
            if (turn === 'w') { turn = 'white'}
            if (turn === 'b') { turn = 'black'}
            this.engine.stdin.write(
                turn + "\n"
            );
        }
    }

    kill() {
        // console.log("killing engine", this.roomName);
        if(this.engine && this.engine.stdin) {
            this.engine.stdin.pause();
            this.engine.kill();
        }
        
        this.engine = null;
    }
}

export default Engine;