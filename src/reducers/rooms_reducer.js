import {LOGOUT_SUCCESS} from '../actions/index';

const initialState = [];

export default function rooms(state = initialState, action) {
    switch(action.type) {
        case 'all-rooms':
            return action.payload;
        case 'reconnect':
            return initialState;
        case LOGOUT_SUCCESS:
            return initialState;
        default:
            return state;
    }
}
