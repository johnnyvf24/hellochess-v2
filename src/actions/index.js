import axios from 'axios';
import {browserHistory} from 'react-router'
import Auth0Lock from 'auth0-lock';

import {CALL_API} from '../middleware/api'

const CLIENT_ID = 'mosofgFAPwKVNHrSkDEnltRUcDKEBJ13';
const DOMAIN = 'johnnyvf24.auth0.com';

const AUTH_URL = `https://${DOMAIN}/api/v2/`

export const LOGIN_SUCCESS = 'LOCK_SUCCESS'
export const LOGIN_ERROR = 'LOCK_ERROR'

const lock = new Auth0Lock(CLIENT_ID, DOMAIN, {
    auth: {
        redirectUrl: 'http://localhost:8080/login',
        responseType: 'token'
    },
    theme: {
        logo: 'https://www.hellochess.com/img/alpha_banner.png'
    },
    languageDictionary: {
        emailInputPlaceholder: "your email",
        title: "Log in"
    },
});

function showLock() {
    return {
        type: SHOW_LOCK
    }
}

function loginSuccess(profile) {
    return {
        type: LOGIN_SUCCESS,
        profile
    }
}

function loginError(error) {
    return {
        type: LOGIN_ERROR,
        error
    }
}

export function login() {
    // display the lock widget
    return dispatch => {
        lock.show();
    }
}

export const LOGOUT_SUCCESS = 'LOGOUT_SUCCESS'

function logoutSuccess(profile) {
    return {
        type: LOGOUT_SUCCESS
    }
}

export function logout() {
    return dispatch => {
        localStorage.removeItem('id_token');
        localStorage.removeItem('profile');
        return dispatch(logoutSuccess());
    }
}

// Listen to authenticated event and get the profile of the user
export function doAuthentication() {

    return dispatch => {
        lock.on("authenticated", function(authResult) {
            lock.getProfile(authResult.idToken, function(error, profile) {

                if (error) {
                    // handle error
                    return dispatch(loginError(error))
                }

                localStorage.setItem('profile', JSON.stringify(profile))
                localStorage.setItem('id_token', authResult.idToken)
                browserHistory.replace('/live')
                return dispatch(loginSuccess(profile))
            });
        });
    }
}

export const PATCH_USERNAME = 'PATCH_USERNAME'

export function saveUsername(userId, username) {
    const config = {
        headers: {
            "Authorization": `bearer ${localStorage.getItem('id_token')}`,
            "Content-Type": "application/json"
        }
    }
    const URL = `${AUTH_URL}users/${userId}`;
    const request = axios.patch(URL, {
        user_metadata: {
            username: username
        }
    }, config);

    return {
        type: PATCH_USERNAME,
        payload: request
    }
}

export const CLEAR_ERROR = 'CLEAR_ERROR';

export function clearError() {
    return  {
        type: CLEAR_ERROR
    }
}


export const SELECTED_CHAT = 'SELECTED_CHAT';

export function selectedChat(name) {
    return (dispatch) =>{
        return dispatch({
            type: SELECTED_CHAT,
            payload: name
        });
    }
}

export function userConnect(profile) {
    return (dispatch) => {
        return dispatch({
            type: 'server/connected-user',
            payload: {
                user: {
                    username: profile.user_metadata.username,
                    user_id: profile.user_id,
                    picture: profile.picture
                }
            }
        });
    }
}

export function newChat(name) {
    return (dispatch) => {
        let obj = {};
        obj[name] = {
            name: name,
            messages: [],
        }

        return dispatch({
            type: 'server/new-chat',
            payload: obj
        });
    }
}

export function joinChat(name) {
    return (dispatch) => {
        let obj = {};
        obj[name] = {
            name: name,
            messages: [],
        }

        return dispatch({
            type: 'server/join-chat',
            payload: obj
        });
    }
}
