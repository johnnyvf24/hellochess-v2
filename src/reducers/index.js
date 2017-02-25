import {combineReducers} from 'redux';
import {reducer as notifications} from 'react-notification-system-redux';
import { reducer as formReducer } from 'redux-form';
import Chess from 'chess.js';

import FourChess from '../../common/fourchess';
import rooms from './rooms_reducer';
import AuthReducer from './auth_reducer';
import newGameOptions from './new_game_reducer';

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
    switch(action.type) {
        case 'user-room-joined':
            const users = action.payload.users;
            const joined_user = action.payload.users[action.payload.users.length-1].username;
            let joined_msg = joined_user + " has joined the room.";
            msg_obj = {
                user: joined_user,
                msg: joined_msg,
                thread: action.payload,
                picture: null,
                event_type: 'user-joined'
            };
            roomName = action.payload.room.name;
            messages = [...state[roomName].messages, msg_obj];
            obj = {...state[roomName], users, messages};
            return {...state, [roomName]: obj};
        case 'user-room-left':
            roomName = action.payload.name;
            const user = action.payload.user;
            newState = Object.assign({}, state);
            newState[roomName].users = newState[roomName].users.filter((member) => {
                return user.user._id !== member._id;
            });
            let left_msg = user.user.username + " has left the room.";
            msg_obj = {
                user: user.user.username,
                msg: left_msg,
                thread: action.payload,
                picture: null,
                event_type: 'user-left'
            };
            messages = [...newState[roomName].messages, msg_obj];
            obj = {...newState[roomName], messages};
            return {...newState, [roomName]: obj};
        case 'joined-room':
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
            newState[action.payload.thread][action.payload.lastTurn].time = action.payload.time;
            return newState;
        case 'four-new-move':
            newState = Object.assign({}, state);
            newState[action.payload.thread].fen = action.payload.fen;
            newState[action.payload.thread].turn = action.payload.turn;
            newState[action.payload.thread].move = action.payload.move;
            //newState[action.payload.thread][action.payload.lastTurn].time = action.payload.time;
            return newState;
        case 'four-resign':
            newState = Object.assign({}, state);
            switch(action.payload.color) {
                case 'w':
                    newState[action.payload.thread].white.resigned = true;
                    break;
                case 'b':
                    newState[action.payload.thread].black.resigned = true;
                    break;
                case 'g':
                    newState[action.payload.thread].gold.resigned = true;
                    break;
                case 'r':
                    newState[action.payload.thread].red.resigned = true;
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
            return newState;
        case 'timer-sync':
            if(state[action.payload.thread][action.payload.turn]) {
                newState = Object.assign({}, state);
                newState[action.payload.thread][action.payload.turn].time = action.payload.timeLeft;
                return newState;
            }
            return state;
        case 'sit-down-white':
            newState = Object.assign({}, state);
            newState[action.payload.thread].white = action.payload.room;
            return newState;
        case 'sit-down-black':
            newState = Object.assign({}, state);
            newState[action.payload.thread].black = action.payload.room;
            return newState;
        case 'sit-down-gold':
            newState = Object.assign({}, state);
            newState[action.payload.thread].gold = action.payload.room;
            return newState;
        case 'sit-down-red':
            newState = Object.assign({}, state);
            newState[action.payload.thread].red = action.payload.room;
            return newState;
        case 'up-white':
            newState = Object.assign({}, state);
            delete newState[action.payload.name].white;
            return newState;
        case 'up-black':
            newState = Object.assign({}, state);
            delete newState[action.payload.name].black;
            return newState;
        case 'up-gold':
            newState = Object.assign({}, state);
            delete newState[action.payload.name].gold;
            return newState;
        case 'up-red':
            newState = Object.assign({}, state);
            delete newState[action.payload.name].red;
            return newState;
        case 'game-started':
            newState = Object.assign({}, state);
            newState[action.payload.thread].fen = action.payload.fen;
            return newState;
        case 'four-game-started':
            newState = Object.assign({}, state);
            newState[action.payload.thread].fen = action.payload.fen;
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
        case 'connected':
            return {status: true};
        default:
            return state;
    }
}

function activeGame(state=false, action) {
    switch(action.type) {
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
    newGameOptions,
    auth: AuthReducer,
    form: formReducer,
});

export default rootReducer;
