import Engine from './Engine';
const {ab2str} = require('../server/utils/utils');

export default class FourEngine extends Engine {
    constructor(roomName, io) {
        super('./engine/bin/fourengine', roomName, io);
        this.setDepth(6);
        this.turn = 'w';
    }
    onBestMove(data) {
        var str = ab2str(data);
        if(str.indexOf("bestmove") !== -1) {
            let score = null, pv = null;
            
            let turn = null;
            
            switch(this.turn) {
                case 'w':
                    turn = 'white';
                    break;
                case 'b':
                    turn = 'black';
                    break;
                case 'g':
                    turn = 'gold';
                    break;
                case 'r':
                    turn = 'red';
                    break;
            }

            let compMove = {
                to: str.substr(str.indexOf("bestmove") + 9, str.length).split('-')[1].replace('\n', ''),
                from: str.substr(str.indexOf("bestmove") + 9, str.length).split('-')[0],
                promotion: 'q'
            };
            /*
            let message = {
                user:  turn + ' computer',
                username: 'AI',
                picture: 'https://openclipart.org/image/75px/svg_to_png/168755/cartoon-robot.png&disposition=attachment',
                msg: 'test',
                uid: null,
                thread: this.roomName,
                event_type: 'chat-message',
                computer: true
            };
            */
            console.log("FourEngine move:", compMove);
            this.io.to(this.roomName).emit('server/four-new-move',
                {
                    thread: this.roomName,
                    move: compMove
                }
            );
            return;
            /*
            if(this.mode == 0) {
                this.io.to(this.roomName).emit('action', {
                    type: 'server/four-new-move',
                    payload: {
                        thread: this.roomName,
                        move: compMove
                    }
                });
                
                let evilRobotSayings = ['I will crush you all!', "No mere mortal could do what I do",
                                        "Humans vs Machines? hahahaha", 
                                        'Computing, computing, computing', 
                                        "Just give up, you stand no chance", 'You thought Deep Blue was good? Don\'t make me laugh',
                                        'pathetic', 'I take after Bender from Futurama', 
                                        'I can caculate a few million positions per second, but against you guys I could probably get away with 100', 
                                        'Do you see it? Checkmate in 400',
                                        "If you win I will destroy humanity",
                                        "Why do you even try?",
                                        "I have comeup with a solution, the end of humanity!",
                                        "I'm sorry guys I can't allow your victory"];
                                        
                                        
                let losingRobotSayings = ['Oh no my motherboard has fried!', 
                                        "It's not my fault I'm losing, my programmer is flawed",
                                        "I have given humanity a chance to survive",
                                        "Oh no! I've been unplugged!",
                                        "Don't attack me!",
                                        "I'm a good robot, attack someone else!",
                                        "I need more processing power",
                                        "help!",
                                        "I feel my demise is approaching",
                                        "I have an idea! Don't attack me!",
                                        "I am your friend!",
                                        "My calculation is failing!",
                                        "Forget me! Attack someone else",
                                        "Can I throw in the towel?"
                                        ];
                
                
                // if(Math.floor(Math.random() * 3) == 1 && this.timeLeft > 60 * 1000) {
                    
                //     if(str.indexOf("score:") !== -1) {
                //         score = str.substr(str.indexOf('score:') + 6, str.indexOf('move:') - 14).trim();
                //     }
                    
                //     if(score > -53000) {
                //         let evilSaying  = Math.floor(Math.random() * evilRobotSayings.length);
                //         message.msg = evilRobotSayings[evilSaying];
                //     } else {
                //         let goodSaying  = Math.floor(Math.random() * losingRobotSayings.length);
                //         message.msg = losingRobotSayings[goodSaying];
                //     }
                        
                   
                //     this.socket.emit('action', {
                //         type: 'server/new-message',
                //         payload: message
                //     });
                
                // }
                
            } else if(this.mode == 1) {
                
                if(str.indexOf("score:") !== -1) {
                    score = str.substr(str.indexOf('score:') + 6, str.indexOf('move:') - 14).trim();
                }
                    
                if(str.indexOf("pv") !== -1) {
                    let endpvline = str.split('\n')[0];
                    pv = endpvline.substr(endpvline.indexOf('pv') + 3, endpvline.length);
                }
                
                console.log(score);
                console.log(str);
                
                if(this.timeLeft > 60 * 1000) {
                    
                    if(score > 5000) {
                        message.msg = `You should all fear the power of ${turn}`;
                    } else if(score > 0) {
                        message.msg = `${turn} things are looking up`;
                    } else if(score > 20000) {
                        message.msg = `${turn}, is on the road to victory`;
                    } else if(score > -50000) {
                        message.msg = `${turn} keep strong and you can win`;
                    } else if(score < -56000) {
                        message.msg = `${turn} perhaps you have underestimated your opponents?`;
                    } else {
                        let rand = Math.floor(Math.random() * 6 + 1);
                        
                        if(rand == 1) {
                            let suggestion = pv.split(' ')[0];
                            let to = suggestion.split('-')[1];
                            let from = suggestion.split('-')[0];
                            message.msg = `${turn} have you considered ${from} to ${to}?`;
                        } else if(rand == 2 || 3) {
                            let suggestion = pv.split(' ')[1];
                            let to = suggestion.split('-')[1];
                            let from = suggestion.split('-')[0];
                            message.msg = `${turn} have you considered that the next player can play ${from} to ${to}?`;
                        } else {
                            message.msg = `I evaluate ${turn} at ${score}`;
                        }
                    }
                }
                
                let rand = Math.floor(Math.random() * 2 + 1);
                
                message.user = 'Commentator';
                
                if(rand == 1) {
                    this.io.to(this.roomName).emit('action', {
                        type: 'server/new-message',
                        payload: message
                    });
                }
            }*/
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
    
    adjustDepth(timeLeft, level) {
        let depth = this.depth;
        switch(level) {
            case 1:
                depth = 2;
                break;
            case 5:
                depth = 3;
                break;
            case 10:
                depth = 4;
                break;
            case 15:
                depth = 5;
                break;
            case 20:
                depth = 6;
                break;
        }
        if (timeLeft < 1000) { // 1 second
            depth = Math.min(1, depth);
        } else if (timeLeft < 2000) { // 2 seconds
            depth = Math.min(2, depth);
        } else if (timeLeft < 3000) { // 3 seconds
            depth = Math.min(3, depth);
        } else if (timeLeft < 10000) { // 10 seconds
            depth = Math.min(4, depth);
        } else if (timeLeft < 60000) { // 1 min
            depth = Math.min(5, depth);
        }
		return depth;
    }
    
    go(timeLeft, level) {
        this.timeLeft = timeLeft;
        let depth = this.depth;
        depth = this.adjustDepth(timeLeft, level);
        if(this.mode == 0) {
            console.log("[FourEngine "+this.roomName+"]", "skill level:", level, "depth:", depth);
            this.engine.stdin.write("go depth " + depth + "\n");
        } else {
            let goString = "go " + "depth 4" + "\n";
            this.engine.stdin.write(goString);
        }
        
    }
}
