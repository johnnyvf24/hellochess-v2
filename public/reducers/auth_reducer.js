import {
    isTokenExpired
} from '../utils/jwtHelper';


import * as ActionTypes from '../actions'

function getProfile() {
  return JSON.parse(localStorage.getItem('profile'));
}

//SETUP initial app state
let authenticated = false;
const token = localStorage.getItem('id_token');
if (token && !isTokenExpired(token)) {
    authenticated = true;
}
const INITIAL_STATE = {
    profile: getProfile(),
    isAuthenticated: authenticated
}

//The auth reducer
function auth(state = INITIAL_STATE, action) {
    switch (action.type) {
        case ActionTypes.LOGIN_SUCCESS:
            return Object.assign({}, state, {
                isAuthenticated: true,
                profile: action.profile,
                error: ''
            })
        case ActionTypes.LOGIN_ERROR:
            return Object.assign({}, state, {
                isAuthenticated: false,
                profile: null,
                error: action.error
            })
        case ActionTypes.LOGOUT_SUCCESS:
            return Object.assign({}, state, {
                isAuthenticated: false,
                profile: null
            })
        case ActionTypes.PATCH_USERNAME:
            return Object.assign({}, state, {
                profile: action.payload.data
            })
        default:
            return state
    }
}
export default auth;
