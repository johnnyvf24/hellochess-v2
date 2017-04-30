import {isTokenExpired} from '../utils/jwtHelper';
import * as ActionTypes from '../actions/types'

function getProfile() {
    if(typeof(Storage) === "undefined") {
        return {};
    }
    return JSON.parse(localStorage.getItem('profile'));
}

function setProfile(profile) {
    if(typeof(Storage) === "undefined") {
        return {};
    }
    return localStorage.setItem('profile', JSON.stringify(profile));
}

//SETUP initial app state
let authenticated = false;
let token = null;
if(typeof(Storage) !== "undefined") { 
    token = localStorage.getItem('id_token');
}

if (token && !isTokenExpired(token)) {
    authenticated = true;
}
const INITIAL_STATE = {
    profile: getProfile(),
    isAuthenticated: authenticated,
    voice: false
}

//The auth reducer
function auth(state = INITIAL_STATE, action) {
    let newState = null;
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
            setProfile(action.payload.data);
            newState = Object.assign({}, state)
            newState.profile = getProfile();
            return newState;
        case 'update-user':
            setProfile(action.payload);
            newState = Object.assign({}, state)
            newState.profile = getProfile();
            return newState;
        case 'reconnect':
            if(typeof(Storage) !== "undefined") {
                localStorage.removeItem('token');
                localStorage.removeItem('profile');
            }
            return INITIAL_STATE;
        default:
            return state
    }
}
export default auth;
