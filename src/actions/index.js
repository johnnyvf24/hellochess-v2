import axios from 'axios'
import {browserHistory} from 'react-router'
import {CALL_API} from '../middleware/api'
import {
    LOGIN_SUCCESS,
    LOGIN_ERROR,
    LOGOUT_SUCCESS,
    SELECTED_CHAT,
    UPDATE_USERNAME
} from './types'

import Notifications from 'react-notification-system-redux';

const ROOT_URL = 'http://localhost:3000';

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
                browserHistory.push('/live');
                return dispatch({type: LOGIN_SUCCESS, payload: res.data});
            })
            .catch((e) =>{
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
                    username: profile.username,
                    _id: profile._id,
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
