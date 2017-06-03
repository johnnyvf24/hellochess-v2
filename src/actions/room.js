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
        
        game.pgn = 'w:j1-i3 g:b8-c8 b:e14-f12 r:n10-l9 w:j2-j3 g:a10-c9 b:j14-i12 r:n5-l6 w:g2-g3 g:b7-c7 b:e13-e12 r:m4-l4 w:e1-g2 g:a6-b7 b:j13-j12 r:m11-l11 w:e2-e3 g:b4-c4 b:k13-k12 r:m10-l10 w:f1-e2 g:a8-b8 b:h13-h12 r:n9-m10 w:k2-k3 g:a7-a8 b:k12-l11 r:m10-l11 w:k3-k4 g:b7-g2 b:i14-g12 r:l11-j13 w:i3-g2 g:a5-c6 b:k14-k13 r:j13-i12 w:i1-j2 g:b11-d11 b:g12-h13 r:i12-h13 w:f2-f4 g:d11-e12 b:f12-h13 r:n8-n9 w:e2-f3 g:e12-f13 b:g14-f13 r:n11-a11 w:g1-f2 g:a4-a6 b:f14-e13 r:n9-n11 w:f2-e2 g:a8-b7 b:h14-i14 r:a11-m11 w:h1-g1 g:b7-a7 b:h13-f12 r:l6-m4 w:g1-f2 g:c4-d4 b:i14-h13 r:m11-j11 w:e3-e4 g:c6-b4 b:d14-k14 r:m4-k5 w:f2-f1 g:b6-c6 b:f12-e10 r:k5-l7 w:d2-d3 g:b8-a8 b:e13-f12 r:l7-k9 w:g2-i3 g:a9-b8 b:e10-f8 r:m7-l7 w:e2-g2 g:a8-b7 b:f13-g14 r:n4-n5 w:f1-e1 g:a7-b6 b:f8-h7 r:n6-l8 w:e1-e2 g:a6-a10 b:h7-i9 r:j11-m11 w:i3-g4 g:b10-d10 b:h13-i12 r:n7-m7 w:j2-i3 g:c9-e10 b:f12-e13 r:m6-l6 w:g4-f2 g:e10-d8 b:k13-k10 r:n11-m10 w:d1-i1 g:b6-a6 b:k10-h10 r:n5-n11 w:e2-d1 g:b5-d5 b:k14-k10 r:l8-k7 w:f3-e2 g:d5-e4 b:h10-h7 r:m10-i14 w:d3-e4 g:a6-a5 b:g14-f13 r:m11-f11 w:i3-d8 g:a5-m5 b:e13-f12 r:m7-n7 w:d8-j2 g:m5-n5 b:i12-j13 r:n7-m7 w:f2-d3 g:n5-m5 b:j13-i14 r:m7-n7 w:d3-b4 g:m5-n5 b:i14-f11 r:n7-m7 w:e4-e5 g:n5-m5 b:h7-h8 w:e5-e6 g:m5-i5 b:k10-e10 w:b4-c6 g:d4-e4 b:e10-e6 w:c6-e5 g:c7-d7 b:e6-e12 w:j2-h4 g:i5-m5 b:f11-h9 w:g2-e4 g:b7-a7 b:i13-i11 w:e2-f3 b:f12-h10 w:i1-e1 b:i9-h7 w:e1-e2 b:h7-f6 w:h4-f6 b:h8-h2 w:f3-g4 b:h2-h6 w:f6-g5 b:h6-d6 w:e2-d2 b:d6-j6 w:k1-e1 b:h10-i9 w:e4-f5 b:f13-g14 w:g4-l9 b:g14-h14 w:f5-f14 b:h14-i13 w:f14-g13 b:i13-j14 w:l9-i12 b:h9-h5 w:g3-g4 b:h5-g4 w:e5-g4 b:e12-e1 w:d1-e1 b:j6-e6 w:e1-f1 b:e6-e1 w:f1-g2 b:e1-g1 w:g2-g1 b:i9-d4 w:d2-d4 b:h12-h11 w:g13-j13 w:j13-j14';
        
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
                    promotion: 'q',
                    color: move.split(':')[0]
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