import {isTokenExpired} from '../utils/jwtHelper';
import * as ActionTypes from '../actions/types'

function getProfile() {
  return JSON.parse(localStorage.getItem('profile'));
}

function setProfile(profile) {
    return localStorage.setItem('profile', JSON.stringify(profile));
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
            return {...state, authenticated: true, profile: getProfile()}
        case ActionTypes.LOGIN_ERROR:
            return {...state, authenticated: false};
        case ActionTypes.LOGOUT_SUCCESS:
            return Object.assign({}, state, {
                authenticated: false,
                profile: null
            });
        case ActionTypes.UPDATE_USERNAME:
            setProfile(action.payload.data)
            return Object.assign({}, state, {
                profile: action.payload.data
            })
        case 'reconnect':
            localStorage.removeItem('token');
            localStorage.removeItem('profile');
            return INITIAL_STATE;
        default:
            return state
    }
}
export default auth;
