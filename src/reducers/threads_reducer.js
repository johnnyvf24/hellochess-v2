import {combineReducers} from 'redux';

//sets the active thread
function activeThread(state, action) {
    switch(action.type) {
        case 'joined-chatroom':
            return action.payload.name;
        default:
            return state;
    }
}
