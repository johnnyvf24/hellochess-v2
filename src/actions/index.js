import axios from 'axios'
import {browserHistory} from 'react-router'
import {CALL_API} from '../middleware/api'
import {
    LOGIN_SUCCESS,
    LOGIN_ERROR,
    LOGOUT_SUCCESS,
    SELECTED_ROOM,
    UPDATE_USERNAME
} from './types'

import Notifications from 'react-notification-system-redux';

const ROOT_URL = 'http://localhost:3000';

export function googleLoginUser(token) {
    return (dispatch) => {
        axios.get(`${ROOT_URL}/api/auth/google/token?access_token=${token}`, {
            access_token: token
        }).then((res) => {
            localStorage.setItem('token', res.headers['x-auth']);
            localStorage.setItem('profile', JSON.stringify(res.data));
            dispatch({type: LOGIN_SUCCESS, payload: res.data});
            browserHistory.push('/live');
        }).catch((e) => {

            const notificationOpts = {
                // uid: 'once-please', // you can specify your own uid if required
                title: 'Failed to authenticate through Google',
                message: e.response.data,
                position: 'tc',
                autoDismiss: 0
            };

            //Show failed log in
            dispatch(
                Notifications.error(notificationOpts)
            );

            dispatch({type: LOGIN_ERROR});
        })
    }
}

export function fbLoginUser(token) {
    return (dispatch) => {
        axios.post(`${ROOT_URL}/api/auth/facebook/token`, {
            access_token: token
        }).then((res) => {
            localStorage.setItem('token', res.headers['x-auth']);
            localStorage.setItem('profile', JSON.stringify(res.data));
            dispatch({type: LOGIN_SUCCESS, payload: res.data});
            browserHistory.push('/live');
        }).catch((e) => {
            const notificationOpts = {
                // uid: 'once-please', // you can specify your own uid if required
                title: 'Failed to authenticate through Facebook',
                message: e.response.data,
                position: 'tc',
                autoDismiss: 0
            };

            //Show failed log in
            dispatch(
                Notifications.error(notificationOpts)
            );

            dispatch({type: LOGIN_ERROR});
        })
    }
}

export function signUpUser({signUpEmail, signUpPassword}) {
    return (dispatch) => {
        const data = {
            email: signUpEmail,
            password: signUpPassword
        }
        axios.post(`${ROOT_URL}/api/users/signup`, data)
            .then((res) => {
                //Save access token to local storage
                localStorage.setItem('token', res.headers['x-auth']);
                localStorage.setItem('profile', JSON.stringify(res.data));
                //redirect to main page

                dispatch({type: LOGIN_SUCCESS, payload: res.data});
                browserHistory.push('/live');
            })
            .catch(function (error) {
                const notificationOpts = {
                    // uid: 'once-please', // you can specify your own uid if required
                    title: 'Authentication error',
                    message: error.response.data,
                    position: 'tc',
                    autoDismiss: 0
                };

                //Show failed log in
                dispatch(
                    Notifications.error(notificationOpts)
                );

                dispatch({type: LOGIN_ERROR});
            })
    }
}

export function loginUser({loginEmail, loginPassword}) {
    return (dispatch) => {
        const data = {
            email: loginEmail,
            password: loginPassword
        };
        //Submit email and password to API
        axios.post(`${ROOT_URL}/api/users/login`, data)
            .then((res) =>{
                //Save access token to local storage
                localStorage.setItem('token', res.headers['x-auth']);
                localStorage.setItem('profile', JSON.stringify(res.data));
                //redirect to main page
                dispatch({type: LOGIN_SUCCESS, payload: res.data});
                browserHistory.push('/live');
            })
            .catch((res) =>{
                const notificationOpts = {
                    // uid: 'once-please', // you can specify your own uid if required
                    title: 'Authentication error',
                    message: 'Invalid email or password',
                    position: 'tc',
                    autoDismiss: 0
                };

                //Show failed log in
                dispatch(
                    Notifications.error(notificationOpts)
                );

                dispatch({type: LOGIN_ERROR})
                // return dispatch(authError('Incorrect login info'));
            });

    }
}

export function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('profile');
    return {
        type: LOGOUT_SUCCESS
    }
}

function generateTokenHeader() {
    return {
        headers: {
            "x-auth": localStorage.getItem('token')
        }
    };
}

export function saveUsername(id, username) {
    const tokenHeader = generateTokenHeader();

    const request = axios.patch(`${ROOT_URL}/api/users/${id}`, {username}, tokenHeader);

    return {
        type: UPDATE_USERNAME,
        payload: request
    }
}

export function selectedRoom(name) {
    return (dispatch) =>{
        return dispatch({
            type: SELECTED_ROOM,
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
                    username: profile.username,
                    _id: profile._id,
                    picture: profile.picture
                }
            }
        });
    }
}

export function newRoom(name, profile) {
    return (dispatch) => {
        let obj = {};
        obj[name] = {
            name: name,
            messages: [],
            host: profile
        }

        return dispatch({
            type: 'server/new-room',
            payload: obj
        });
    }
}

let initGameOptions = {
    gameType: 'four-player',
    room: {
        private: false,
        voiceChat: false,
        maxPlayers: 10000,
    },
    time: {
        increment: 0,
        value: 10
    }
};

export function joinRoom(name, gameOptions = initGameOptions) {
    return (dispatch) => {
        let obj = {};
        gameOptions.room.name = name;
        obj[name] = gameOptions;

        return dispatch({
            type: 'server/join-room',
            payload: obj
        });
    }
}

export function leaveRoom(name) {
    return (dispatch) => {
        return dispatch({
            type: 'server/leave-room',
            payload: name
        });
    }
}

export function showError(error) {
    return (dispatch) => {
        const notificationOpts = {
            // uid: 'once-please', // you can specify your own uid if required
            title: 'oops...',
            message: error,
            position: 'tc',
            autoDismiss: 2
        };

        //Show failed log in
        dispatch(
            Notifications.error(notificationOpts)
        );
    }
}
