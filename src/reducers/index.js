import {combineReducers} from 'redux';
import error from './error_reducer';
import existingChatRooms from './chat_rooms_reducer';
import threads from './threads_reducer';
import AuthReducer from './auth_reducer';
import {reducer as notifications} from 'react-notification-system-redux';

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
    switch(action.type) {
        case 'joined-chatroom':
            return {...state, [action.payload.name]: action.payload };
        case 'receive-message':
            const messages = [...state[action.payload.thread].messages, action.payload];
            const obj = {...state[action.payload.thread], messages};
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
});

export default rootReducer;
