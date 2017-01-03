import {
    CALL_API
} from '../middleware/api'

import Auth0Lock from 'auth0-lock';
// There are two possible states for our login
// process and we need actions for each of them.
//
// We also need one to show the Lock widget.
export const SHOW_LOCK = 'SHOW_LOCK'
export const LOCK_SUCCESS = 'LOCK_SUCCESS'
export const LOCK_ERROR = 'LOCK_ERROR'

function showLock() {
    return {
        type: SHOW_LOCK
    }
}

function lockSuccess(profile, token) {
    return {
        type: LOCK_SUCCESS,
        profile,
        token
    }
}

function lockError(err) {
    return {
        type: LOCK_ERROR,
        err
    }
}

// Opens the Lock widget and
// dispatches actions along the way
export function login() {
    const lock = new Auth0Lock('mosofgFAPwKVNHrSkDEnltRUcDKEBJ13', 'johnnyvf24.auth0.com');
    return dispatch => {
        lock.show((err, profile, token) => {
            if (err) {
                dispatch(lockError(err))
                return
            }
            localStorage.setItem('profile', JSON.stringify(profile))
            localStorage.setItem('id_token', token)
            dispatch(lockSuccess(profile, token))
        })
    }
}

// Three possible states for our logout process as well.
// Since we are using JWTs, we just need to remove the token
// from localStorage. These actions are more useful if we
// were calling the API to log the user out
export const LOGOUT_REQUEST = 'LOGOUT_REQUEST'
export const LOGOUT_SUCCESS = 'LOGOUT_SUCCESS'
export const LOGOUT_FAILURE = 'LOGOUT_FAILURE'

function requestLogout() {
    return {
        type: LOGOUT_REQUEST,
        isFetching: true,
        isAuthenticated: true
    }
}

function receiveLogout() {
    return {
        type: LOGOUT_SUCCESS,
        isFetching: false,
        isAuthenticated: false
    }
}


// Logs the user out
export function logoutUser() {
    return dispatch => {
        dispatch(requestLogout())
        localStorage.removeItem('id_token')
        dispatch(receiveLogout())
    }
}
