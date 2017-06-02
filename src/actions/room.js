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
        game.pgn = 'w:j1-i3 g:b8-d8 b:g13-g12 r:n10-l9 w:j2-j3 g:b9-c9 b:f14-g13 r:m11-k11 w:i1-j2 g:a10-b8 b:e14-f12 r:k11-j11 w:g2-g3 g:b10-c10 b:g14-e14 r:m8-l8 w:e1-g2 g:a9-c11 b:k13-k12 r:j11-i11 w:h2-h3 g:a8-a10 b:f12-e10 r:m10-k10 w:e2-e3 g:b8-d9 b:e10-c11 r:k10-j10 w:f1-b5 g:d9-c11 b:d13-d12 r:l9-k11 w:b5-a4 g:a6-e2 b:d12-c11 r:n11-m11 w:d1-e1 g:e2-d3 b:j14-i12 r:k11-i10 w:a4-d7 g:a10-a11 b:g13-f12 r:m9-k9 w:d7-g4 g:a5-c6 b:i12-g11 r:i10-j8 w:h1-j1 g:b4-c4 b:g11-e10 r:n5-l6 w:g2-f4 g:a7-a4 b:e10-c9 r:m7-l7 w:e3-e4 g:b7-c7 b:c9-e10 r:n7-m8 w:i1-h1 g:a4-a6 b:e10-d12 r:m4-l4 w:e1-e3 g:c6-b8 b:f12-b8 r:n6-m7 w:g1-e1 g:a9-a8 b:d12-c10 r:l6-k8 w:i3-g2 g:b11-c10 b:b8-f12 r:n8-l10 w:f2-f3 g:a11-b11 b:f12-g13 r:k9-j9 w:e1-f2 g:b11-c11 b:g13-d10 r:j8-i10 w:f4-d3 g:c11-b11 b:h14-e11 r:k8-i9 w:d3-f4 g:b11-b10 b:e11-c11 r:l10-i13 w:d2-d3 b:c11-b10 r:m11-k11 w:d3-c4 b:b10-b9 r:n9-l11 w:g4-b9 b:d10-h14 r:i13-f10 w:b9-g4 b:h14-k11 r:l11-k10 w:c4-c5 b:k11-h14 r:n4-n11 w:c5-b6 b:h14-f12 r:l8-k8 w:e3-d3 b:f14-g14 r:i10-h12 w:b6-c7 b:g12-g11 r:f10-i10 w:c7-d8 b:g14-f14 r:i9-h11 w:d8-d9 b:f12-d10 r:h11-i13 w:h1-d1 b:k14-j14 r:i10-d10 w:g2-i1 b:f13-f12 r:h12-i14 w:f2-c5 b:f14-i14 r:i13-h11 w:d9-c10 b:j13-j11 r:d10-c11 w:d3-d11 b:j11-k10 r:c11-i5 w:c5-i5 b:k10-j9 r:h11-g13 w:c10-c11 b:e14-f13 r:g13-i14 w:i5-m5 b:j14-i14 r:n11-k11 w:m5-m6 b:e13-e12 r:k11-n11 w:d11-d13 b:f13-g14 r:n11-n6 w:m6-n6 b:g14-h14 r:m7-n6 w:c11-e13 b:h14-i13 r:n6-l8 w:e13-h13 b:i13-j12 r:m8-m7 w:j2-i3 b:j12-k11 w:i3-m7 b:i14-j14 w:h13-i13 b:k11-l11 w:i13-j14 b:j9-k8 w:j14-j10 b:k12-k11 w:j10-n10 b:k8-l7 w:m7-n8 b:l11-k12 w:g4-e6 b:k12-j12 w:n10-g10 b:f12-f11 w:g10-j13 w:j13-j12';
        
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