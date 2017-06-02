import Chess from 'chess.js';
import Crazyhouse from 'crazyhouse.js';
import FourChess from '../../common/fourchess';
import SChess from 'schess.js';
import {CLOSE_ANALYSIS} from './types';

export function sitDownBoard(details) {
    return {
        type: 'server/sit-down-board',
        payload: details
    }
}

export function joinAnalysisRoom(game, gameType, roomName) {
    game.gameType = gameType;
    game.fen = game.final_fen;
    game.numPlayers = 2;
    if(gameType === 'standard') {
        let g = new Chess();
        g.load_pgn(game.pgn);
        game.pgn = g.history({ verbose: true});
        g.reset();
        game.pgn.map((move) => {
           g.move(move);
           move.fen = g.fen();
        });
    } else if(gameType === 'schess') {
        let g = new SChess();
        g.load_pgn(game.pgn);
        game.pgn = g.history({ verbose: true});
        g.reset();
        game.pgn.map((move) => {
           g.move(move);
           move.fen = g.fen();
        });
    } else if(gameType === 'crazyhouse')  {
        let g = new Crazyhouse();
        g.load_pgn(game.pgn);
        game.pgn = g.history({ verbose: true});
        g.reset();
        game.pgn.map((move) => {
           g.move(move);
           move.fen = g.fen();
        });
    } else if(gameType === 'crazyhouse960') {
        let g = new Crazyhouse({960: true});
        g.load_pgn(game.pgn);
        game.pgn = g.history({ verbose: true});
        game.pgn[0].fen = game.initial_fen;
        g.reset();
        g.load(game.initial_fen);
        game.pgn.map((move) => {
           g.move(move);
           move.fen = g.fen();
        });
    } else if(gameType === 'four-player') {
        let g = new FourChess();
        
        game.pgn = game.pgn.trim();
        let moves = game.pgn.split(' ');
        moves.map((move) => {
            console.log(move);
            if(move.length > 1) {
                let fromTo = move.split(':')[1];
                let from = fromTo.split('-')[0];
                let to = fromTo.split('-')[1];
                g.move({
                    from: from,
                    to: to,
                    promotion: 'q'
                });
            }
            
        });
        
        game.numPlayers = 4;
        game.pgn = g.history();
    }
    return {
        type: 'update-room',
        payload: {
            gameType,
            room: {
                private: true,
                voiceChat: false,
                maxPlayers: 10000,
                name: roomName,

            },
            times: {
                b: 2,
                w: 2,
                g: 2,
                r: 2,
            },
            activePly: 0,
            mode: 'analysis',
            time: game.time,
            game,
            
        }
    }
}

export function closeAnalysisRoom(roomName) {
    return {
        type: CLOSE_ANALYSIS,
        payload: roomName
    }
}


export function sitDownComputer(details) {
    return {
        type: 'server/sit-down-board',
        payload: details
    }
}

export function enableMic(thread) {
    return {
        type: 'voice/enable-voice',
        payload: thread
    }
}

export function disableMic(thread) {
    return {
        type: 'voice/disable-voice',
        payload: thread
    }
}

export function removeComputer(player, thread) {
    return {
        type: 'server/remove-ai-player',
        payload: {
            player,
            thread
        }
    }
}

export function updateTime(roomName, turn, time) {
    return {
        type: 'update-time',
        payload: {
            thread: roomName,
            turn: turn,
            time: time
        }
    };
}

export function fourNewMove(move, roomName, moveTime) {
    return {
        type: 'server/four-new-move',
        payload: {
            thread: roomName,
            move: move,
            moveTime: moveTime
        }
    }
}

export function newMove(move, roomName, moveTime) {
    return {
        type: 'server/new-move',
        payload: {
            thread: roomName,
            move: move,
            moveTime: moveTime
        }
    }

}

export function draw(roomName) {
    return {
        type: 'server/draw',
        payload: {
            roomName
        }
    }
}

export function resign(playerId, roomName) {
    return {
        type: 'server/resign',
        payload: {
            playerId,
            roomName
        }
    }
}

export function fourResign(roomName) {
    return {
        type: 'server/four-resign',
        payload: {
            roomName
        }
    }
}

export function acceptDraw(roomName) {
    return {
        type: 'server/accept-draw',
        payload: {
            roomName
        }
    }
}

export function killAIs(roomName) {
    return {
        type: 'server/kill-ais',
        payload: roomName
    }
}

export function abort(roomName) {
    return {
        type: 'server/abort',
        payload: roomName
    }
}

export function changeActivePly(roomName, activePly) {
    return {
        type: 'change-active-ply',
        payload: {
            roomName: roomName,
            activePly: activePly
        }
    }
}

export function openPromotionSelector(roomName, callback) {
    return {
        type: 'open-promotion-selector',
        payload: {
            roomName,
            callback
        }
    };
}

export function closePromotionSelector(roomName) {
    return {
        type: 'close-promotion-selector',
        payload: {
            roomName
        }
    };
}