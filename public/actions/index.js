import {CALL_API} from '../middleware/api'

import { browserHistory } from 'react-router'
import Auth0Lock from 'auth0-lock';


export const LOGIN_SUCCESS = 'LOCK_SUCCESS'
export const LOGIN_ERROR = 'LOCK_ERROR'

const lock = new Auth0Lock('mosofgFAPwKVNHrSkDEnltRUcDKEBJ13', 'johnnyvf24.auth0.com', {
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
