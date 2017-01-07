import {combineReducers} from 'redux';


const initialState = [{
    id: 'blah',
    name: 'Global Chat',
    messages: []
}]

export default function threads(state = {}, action) {
    switch(action.type) {
        case 'joined-chatroom':
            return [...state, action.payload];
        default:
            return state;
    }
}
