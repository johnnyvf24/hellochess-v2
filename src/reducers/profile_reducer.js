import {VIEW_PROFILE} from '../actions/types';

export default function currentProfile(state = {}, action) {
    switch(action.type) {
        case VIEW_PROFILE:
            return action.payload;
        case 'CLEAR_CURRENT_PROFILE':
            return {};
        default:
            return state;
    }
}
