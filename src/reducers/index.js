import {combineReducers} from 'redux';
import {reducer as notifications} from 'react-notification-system-redux';
import { reducer as formReducer } from 'redux-form';
import Chess from 'chess.js';

import FourChess from '../../common/fourchess';
import rooms from './rooms_reducer';
import AuthReducer from './auth_reducer';
import newGameOptions from './new_game_reducer';
import currentProfile from './profile_reducer';

import {SELECTED_ROOM,LOGOUT_SUCCESS} from '../actions/types';

function activeThread (state = 'Global', action) {
    switch(action.type) {
        case SELECTED_ROOM:
            return action.payload;
        case LOGOUT_SUCCESS:
            return 'Global';
        default:
            return state;
    }
}

function openThreads(state = {}, action) {
    let obj = null, newState = null;
    let roomName = null;
    let messages = null, msg_obj = null;
    console.log("action:", action.type);
    switch(action.type) {
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
            return {...state, [action.payload.room.name]: action.payload };
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
            newState[action.payload.thread].fen = action.payload.fen;
            newState[action.payload.thread].turn = action.payload.turn;
            newState[action.payload.thread].pgn = action.payload.pgn;
            newState[action.payload.thread].move = action.payload.move;
            newState[action.payload.thread].lastMove = action.payload.lastMove;
            newState[action.payload.thread][action.payload.lastTurn].time = action.payload.time;
            return newState;
        case 'four-new-move':
            newState = Object.assign({}, state);
            newState[action.payload.thread].fen = action.payload.fen;
            newState[action.payload.thread].turn = action.payload.turn;
            newState[action.payload.thread].move = action.payload.move;
            newState[action.payload.thread].lastMove = action.payload.lastMove;
            newState[action.payload.thread][action.payload.lastTurn].time = action.payload.time;
            if (action.payload.outColor)
                newState[action.payload.thread][action.payload.outColor].alive = false;
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
        case 'timer-sync':
            newState = Object.assign({}, state);
            if(newState[action.payload.thread][action.payload.turn]) {
                newState[action.payload.thread][action.payload.turn].time = action.payload.timeLeft;
                newState[action.payload.thread].turn = action.payload.turn.charAt(0);
                newState[action.payload.thread].fen = action.payload.fen;
                return newState;
            }
            return state;
        case 'TICK':
            if(state[action.payload.thread][action.payload.turn].time) {
                newState = Object.assign({}, state);
                newState[action.payload.thread][action.payload.turn].time -= 1000;
                return newState
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
            return newState;
        case 'four-game-started':
            newState = Object.assign({}, state);
            newState[action.payload.thread].fen = action.payload.fen;
            newState[action.payload.thread].lastMove = action.payload.lastMove;
            newState[action.payload.thread].turn = 'w';
            newState[action.payload.thread].paused = false;
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
        default:
            return state;
    }
}

function connection(state = {status: false, error: false}, action) {
    switch(action.type) {
        case 'duplicate-login':
            return {status: false, error: true};
        case 'disconnect':
            return {status: false};
        case 'connected-user':
            return {status: true};
        default:
            return state;
    }
}


const rootReducer = combineReducers({
    connection,
    notifications,  //notification-center lib
    rooms,      //A list of all available Chat Rooms
    activeThread,
    openThreads,
    currentProfile,
    newGameOptions,
    auth: AuthReducer,
    form: formReducer,
});

export default rootReducer;
