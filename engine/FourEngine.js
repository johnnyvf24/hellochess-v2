const Engine = require('./Engine.js');
const {ab2str} = require('../server/utils/utils');

module.exports = class FourEngine extends Engine {
    constructor(path, roomName, socket) {
        super(path, roomName, socket);
        this.setDepth(6);
        this.turn = 'w';
    }
    onBestMove(data) {
        var str = ab2str(data);
        if(str.indexOf("bestmove") !== -1) {
            let score = null, pv = null;
            
            let message = {
                    user: this.turn + ' computer',
                    username: 'AI',
                    picture: 'https://openclipart.org/image/75px/svg_to_png/168755/cartoon-robot.png&disposition=attachment',
                    msg: 'test',
                    uid: null,
                    thread: this.roomName,
                    event_type: 'chat-message'
                };
            
            if(str.indexOf("score:") !== -1) {
                score = str.substr(str.indexOf('score:') + 6, str.indexOf('move:') - 14).trim();
            }
            
            if(str.indexOf("pv") !== -1) {
                let endpvline = str.split('\n')[0];
                pv = endpvline.substr(endpvline.indexOf('pv') + 3, endpvline.length);
            }

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
            
            console.log(score);
            console.log(str);
            
            if(this.timeLeft > 60 * 1000) {
                if(score > -40000) {
                    message.msg = "I'm doing okay chumps";
                    this.socket.emit('action', {
                        type: 'server/new-message',
                        payload: message
                    });
                } else if(score > -50000) {
                    message.msg = "I have a 1/4 chance of winning!";
                    this.socket.emit('action', {
                        type: 'server/new-message',
                        payload: message
                    });
                } else if(score < -58000) {
                    message.msg = "I fear I have underestimated my opponents";
                    this.socket.emit('action', {
                        type: 'server/new-message',
                        payload: message
                    });
                } else if(score > 0) {
                    message.msg = "You will crumble to my superior smartitud!";
                    this.socket.emit('action', {
                        type: 'server/new-message',
                        payload: message
                    });
                } else if(score > 1000) {
                    message.msg = "I have considered every option, defeat is inevitable!";
                    this.socket.emit('action', {
                        type: 'server/new-message',
                        payload: message
                    });
                } else {
                    message.msg = "Have you considered " + pv + "... ?";
                    this.socket.emit('action', {
                        type: 'server/new-message',
                        payload: message
                    });
                }
            }
            

        }
    }
    
    setPosition(fen) {
        this.engine.stdin.write(
            "position fen " + fen.split('-')[0] + "\n"
        );
    }
    
    setTurn(turnColor) {
        this.turn = turnColor;
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
