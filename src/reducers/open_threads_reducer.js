import {CLOSE_ANALYSIS, LOGOUT_SUCCESS} from '../actions/types';
import {mapObject} from '../utils';

export default function openThreads(state = {}, action) {
    let obj = null, newState = null;
    let roomName = null;
    let messages = null, msg_obj = null;
    let activePly;
    switch(action.type) {
        case 'voice/enable-voice':
            newState = Object.assign({}, state);
            //TODO figure out how to make this nicer
            mapObject(newState, function (key, obj) {
                newState[key].enabledVoice = false;
            });
            newState[action.payload].enabledVoice = true;
            return newState;
            
        case 'voice/disable-voice':
            newState = Object.assign({}, state);
            newState[action.payload].enabledVoice = false;
            return newState;
        case 'server/join-room':
            newState = Object.assign({}, state);
            //TODO figure out how to make this nicer
            mapObject(newState, function (key, obj) {
                newState[key].enabledVoice = false;
            });
            return newState;
        case CLOSE_ANALYSIS:
            newState = Object.assign({}, state);
            delete newState[action.payload];
            return newState;
            
        case 'user-room-left':
            roomName = action.payload.name;
            const user = action.payload.user;
            newState = Object.assign({}, state);
            newState[roomName].users = newState[roomName].users.filter((member) => {
                return user.playerId !== member.playerId;
            });
            msg_obj = action.payload.message;
            messages = [...newState[roomName].messages, msg_obj];
            obj = {...newState[roomName], messages};
            return {...newState, [roomName]: obj};
        case 'update-room':
            newState = {...state, [action.payload.room.name]: action.payload };
            if (state[action.payload.room.name]) {
                activePly = state[action.payload.room.name].activePly;
                let enabledVoice = state[action.payload.room.name].enabledVoice;
                let promotionVisible = state[action.payload.room.name].promotionVisible;
                let promotionCallback = state[action.payload.room.name].promotionCallback;
                if (typeof activePly !== "undefined") {
                    if (activePly === action.payload.game.pgn.length - 1) {
                        newState[action.payload.room.name].activePly = action.payload.game.pgn.length;
                    } else {
                        newState[action.payload.room.name].activePly = activePly;
                    }
                } else {
                    newState[action.payload.room.name].activePly = action.payload.game.pgn.length;
                }
                newState[action.payload.room.name].enabledVoice = enabledVoice;
                newState[action.payload.room.name].promotionVisible = promotionVisible;
                newState[action.payload.room.name].promotionCallback = promotionCallback;;
            } else {
                newState[action.payload.room.name].activePly = action.payload.game.pgn.length;
            }
            return newState;
        case 'left-room':
            newState = Object.assign({}, state);
            delete newState[action.payload];
            return newState;
        case 'receive-message':
            messages = [...state[action.payload.thread].messages, action.payload];
            obj = {...state[action.payload.thread], messages};
            
            return {...state, [action.payload.thread]: obj };
            
        case 'new-move':
            newState = Object.assign({}, state);
            newState[action.payload.thread].game.fen = action.payload.fen;
            newState[action.payload.thread].game.turn = action.payload.turn;
            newState[action.payload.thread].game.pgn = action.payload.pgn;
            newState[action.payload.thread].move = action.payload.move;
            newState[action.payload.thread].lastMove = action.payload.lastMove;
            newState[action.payload.thread][action.payload.lastTurn].time = action.payload.time;
            // update activePly if the game was already on latest move
            activePly = newState[action.payload.thread].activePly;
            if (typeof activePly !== "undefined") {
                if (activePly === action.payload.pgn.length - 1) {
                    newState[action.payload.thread].activePly = action.payload.pgn.length;
                }
            }
            return newState;
        case 'four-new-move':
            newState = Object.assign({}, state);
            newState[action.payload.thread].game.fen = action.payload.fen;
            newState[action.payload.thread].game.turn = action.payload.turn;
            newState[action.payload.thread].move = action.payload.move;
            newState[action.payload.thread].lastMove = action.payload.lastMove;
            newState[action.payload.thread].game[action.payload.lastTurn].time = action.payload.time;
            if (action.payload.outColor)
                newState[action.payload.thread][action.payload.outColor].alive = false;
            // update activePly if the game was already on latest move
            activePly = newState[action.payload.thread].activePly;
            if (typeof activePly !== "undefined") {
                if (activePly === action.payload.pgn.length - 1) {
                    newState[action.payload.thread].activePly = action.payload.pgn.length;
                }
            }
            return newState;
        case 'four-resign':
            newState = Object.assign({}, state);
            switch(action.payload.color) {
                case 'w':
                    newState[action.payload.thread].white.resigned = true;
                    newState[action.payload.thread].white.alive = false;
                    break;
                case 'b':
                    newState[action.payload.thread].black.resigned = true;
                    newState[action.payload.thread].black.alive = false;
                    break;
                case 'g':
                    newState[action.payload.thread].gold.resigned = true;
                    newState[action.payload.thread].gold.alive = false;
                    break;
                case 'r':
                    newState[action.payload.thread].red.resigned = true;
                    newState[action.payload.thread].red.alive = false;
                    break;
            }

            return newState;
        case 'game-over':
            newState = Object.assign({}, state);
            newState[action.payload].fen = '';
            delete newState[action.payload].pgn;
            delete newState[action.payload].white;
            delete newState[action.payload].black;
            delete newState[action.payload].gold;
            delete newState[action.payload].red;
            delete newState[action.payload].move;
            delete newState[action.payload].fen;
            return newState;
        case 'update-time':
            if(state[action.payload.thread].times) {
                newState = Object.assign({}, state);
                newState[action.payload.thread].times[action.payload.turn] = action.payload.time;
                return newState;
            }
            return state;
        case 'sit-down-w':
            newState = Object.assign({}, state);
            newState[action.payload.thread].white = action.payload.player;
            newState[action.payload.thread].paused = true;
            newState[action.payload.thread].white.alive = true;
            newState[action.payload.thread].times.w = action.payload.time;
            return newState;
        case 'sit-down-b':
            newState = Object.assign({}, state);
            newState[action.payload.thread].black = action.payload.player;
            newState[action.payload.thread].paused = true;
            newState[action.payload.thread].black.alive = true;
            newState[action.payload.thread].times.b = action.payload.time;
            return newState;
        case 'sit-down-g':
            newState = Object.assign({}, state);
            newState[action.payload.thread].gold = action.payload.player;
            newState[action.payload.thread].paused = true;
            newState[action.payload.thread].gold.alive = true;
            newState[action.payload.thread].times.g = action.payload.time;
            return newState;
        case 'sit-down-r':
            newState = Object.assign({}, state);
            newState[action.payload.thread].red = action.payload.player;
            newState[action.payload.thread].paused = true;
            newState[action.payload.thread].red.alive = true;
            newState[action.payload.thread].times.r = action.payload.time;
            return newState;
        case 'up-w':
            newState = Object.assign({}, state);
            delete newState[action.payload.name].white;
            return newState;
        case 'up-b':
            newState = Object.assign({}, state);
            delete newState[action.payload.name].black;
            return newState;
        case 'up-g':
            newState = Object.assign({}, state);
            delete newState[action.payload.name].gold;
            return newState;
        case 'up-r':
            newState = Object.assign({}, state);
            delete newState[action.payload.name].red;
            return newState;
        case 'game-started':
            newState = Object.assign({}, state);
            newState[action.payload.thread].fen = action.payload.room.fen;
            newState[action.payload.thread].lastMove = action.payload.room.lastMove;
            newState[action.payload.thread].turn = 'w';
            newState[action.payload.thread].paused = false;
            newState[action.payload.thread].activePly = 0;
            return newState;
        case 'four-game-started':
            newState = Object.assign({}, state);
            newState[action.payload.thread].game = action.payload.room.game;
            newState[action.payload.thread].lastMove = action.payload.room.game.move;
            newState[action.payload.thread].turn = 'w';
            newState[action.payload.thread].paused = false;
            newState[action.payload.thread].activePly = 0;
            return newState;
        case 'clear-timer':
            newState = Object.assign({}, state);
            newState[action.payload.thread].clearTimer = true;
            return newState;
        case 'start-timer':
            newState = Object.assign({}, state);
            newState[action.payload.thread].turn = action.payload.turn;
            newState[action.payload.thread].timeLeft = action.payload.timeLeft;
            newState[action.payload.thread].clearTimer = false;
            return newState;
        case 'pause':
            newState = Object.assign({}, state);
            newState[action.payload.thread].paused = true;
            return newState;
        case 'resume':
            newState = Object.assign({}, state);
            newState[action.payload.thread].paused = false;
            return newState;
        case 'draw-request':
            return state;
        case LOGOUT_SUCCESS:
            return {};
        case 'change-active-ply':
            newState = Object.assign({}, state);
            newState[action.payload.roomName].activePly = action.payload.activePly;
            return newState;
        case 'open-promotion-selector':
            newState = Object.assign({}, state);
            newState[action.payload.roomName].promotionVisible = true;
            newState[action.payload.roomName].promotionCallback = action.payload.callback;
            return newState;
        case 'close-promotion-selector':
            newState = Object.assign({}, state);
            newState[action.payload.roomName].promotionVisible = false;
            return newState;
        default:
            return state;
    }
}