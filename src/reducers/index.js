import {combineReducers} from 'redux';
import {reducer as notifications} from 'react-notification-system-redux';
import { reducer as formReducer } from 'redux-form'

import existingChatRooms from './chat_rooms_reducer';
import fourPlayerRooms from './four_player_rooms_reducer';
import threads from './threads_reducer';
import AuthReducer from './auth_reducer';
import newGameOptions from './new_game_reducer';

import {SELECTED_CHAT} from '../actions/types';

function activeThread (state = 'Global', action) {
    switch(action.type) {
        case SELECTED_CHAT:
            return action.payload;
        default:
            return state;
    }
}

function openThreads(state = {}, action) {
    let obj = null, newState = null;
    switch(action.type) {
        case 'user-room-joined':
            const users = action.payload.users;
            obj = {...state[action.payload.name], users};
            return {...state, [action.payload.name]: obj};
        case 'user-room-left':
            const roomName= action.payload.name;
            const user = action.payload.user;
            newState = Object.assign({}, state);
            newState[roomName].users = newState[roomName].users.filter((member) => {
                return user.user._id !== member._id;
            });
            return newState;
        case 'joined-room':
            return {...state, [action.payload.name]: action.payload };
        case 'left-room':
            newState = Object.assign({}, state);
            delete newState[action.payload];
            return newState;
        case 'receive-message':
            const messages = [...state[action.payload.thread].messages, action.payload];
            obj = {...state[action.payload.thread], messages};
            return {...state, [action.payload.thread]: obj };
        default:
            return state;
    }
}

function connection(state = {status: false, error: false}, action) {
    switch(action.type) {
        case 'duplicate-login':
            return {status: false, error: true};
        case 'connected':
            return {status: true};
        default:
            return state;
    }
}

function viewingGame(state=true, action) {
    switch(action.type) {
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
    existingChatRooms,      //A list of all available Chat Rooms
    activeThread,
    openThreads,
    newGameOptions,
    fourPlayerRooms,
    auth: AuthReducer,
    form: formReducer,
    viewingGame,
    activeGame
});

export default rootReducer;
