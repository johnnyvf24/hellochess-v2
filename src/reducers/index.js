import {combineReducers} from 'redux';
import {reducer as notifications} from 'react-notification-system-redux';
import { reducer as formReducer } from 'redux-form'

import error from './error_reducer';
import existingChatRooms from './chat_rooms_reducer';
import threads from './threads_reducer';
import AuthReducer from './auth_reducer';

import {SELECTED_CHAT} from '../actions';

function activeThread (state = 'Global', action) {
    switch(action.type) {
        case SELECTED_CHAT:
            return action.payload;
        default:
            return state;
    }
}

function openThreads(state = {}, action) {
    let obj = null;
    switch(action.type) {
        case 'user-room-joined':
            const users = action.payload.users;
            obj = {...state[action.payload.name], users};
            return {...state, [action.payload.name]: obj};
        case 'joined-chatroom':
            return {...state, [action.payload.name]: action.payload };
        case 'receive-message':
            const messages = [...state[action.payload.thread].messages, action.payload];
            obj = {...state[action.payload.thread], messages};
            return {...state, [action.payload.thread]: obj };
        default:
            return state;

    }
    return
}


const rootReducer = combineReducers({
    notifications,  //notification-center lib
    error,
    existingChatRooms,      //A list of all Open Chat Rooms
    activeThread,
    openThreads,
    auth: AuthReducer,
    form: formReducer
});

export default rootReducer;
