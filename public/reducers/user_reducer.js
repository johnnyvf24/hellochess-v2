import FETCH_PROFILE_DATA from '../actions/index';

const INITIAL_STATE = {};

export default (state = INITIAL_STATE, action) => {
    switch(action.type) {
        case FETCH_PROFILE_DATA:
            return {
                ...state,
                profile: action.payload
            }
        default:
            return state;
    }
}
