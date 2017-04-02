let spawn = require('child_process').spawn;
const {ab2str} = require('../server/utils/utils');


abstract class Engine {
    public turn: string;
    public depth: number;
    protected engine: any;
    protected numOut;
    protected mode;
    protected timeLeft;
    protected increment;

    constructor(public path, public roomName, public io) {
        this.roomName = roomName;
        this.io = io;
        this.engine = spawn(path);
        this.engine.stdout.on('data', this.onBestMove.bind(this));
        this.numOut = 0;
        this.mode = 0;
        this.sendUci();
    }
    
    abstract go(timeLeft: number, depth: number): void;
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
        this.engine.stdin.write("uci\n");
    }
    
    setOption(name, value) {
        this.engine.stdin.write(
            "setoption name " + name + " value " + value + "\n"
        );
    }

    kill() {
        console.log("killing engine", this.roomName);
        this.engine.stdin.pause();
        this.engine.kill();
    }
}

export default Engine;