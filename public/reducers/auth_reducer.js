import {
    isTokenExpired
} from '../utils/jwtHelper';

import {
    LOCK_SUCCESS,
    LOGOUT_SUCCESS
} from '../index';

let authenticated = false;
const token = localStorage.getItem('id_token');
if (token && !isTokenExpired(token)) {
    authenticated = true;
}

const INITIAL_STATE = {
    isFetching: false,
    isAuthenticated: authenticated
}

//The auth reducer
function auth(state = INITIAL_STATE, action) {
    switch (action.type) {
        case LOCK_SUCCESS:
            return Object.assign({}, state, {
                isFetching: false,
                isAuthenticated: true,
                errorMessage: ''
            })
        case LOGOUT_SUCCESS:
            return Object.assign({}, state, {
                isFetching: true,
                isAuthenticated: false
            })
        default:
            return state
    }
}

export default auth;
