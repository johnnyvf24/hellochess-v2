import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {createStore, applyMiddleware} from 'redux';
import {Router, browserHistory} from 'react-router';
import ReduxPromise from 'redux-promise';
import thunkMiddleware from 'redux-thunk'
import Notifications from 'react-notification-system-redux';

import socketIoMiddleware from './middleware/socketio';
import {socket} from './middleware/socketio';
import api from './middleware/api'
import reducers from './reducers';
import routes from './routes';
import {LOGIN_SUCCESS} from './actions/types';

let createStoreWithMiddleware = applyMiddleware(ReduxPromise, thunkMiddleware, api, socketIoMiddleware)(createStore);
let store = createStoreWithMiddleware(reducers);

//Get the authentication token and user profile if available
const token = localStorage.getItem('token');
const profile = localStorage.getItem('profile');

//The user has both a token and profile, consider them logged in
if(token && profile) {
    store.dispatch({
        type: LOGIN_SUCCESS
    });
}

socket.on('connect_timeout', () => store.dispatch({ type: 'disconnect' }));
socket.on('connect_error', () => store.dispatch({ type: 'disconnect' }));
socket.on('reconnect_error', () => store.dispatch({ type: 'disconnect' }));
socket.on('reconnect', () => store.dispatch({ type: 'reconnect' }));

socket.on('draw-request', (data) => {
    let notif = {
        title: 'Your opponent has offered a draw',
        position: 'tc',
        autoDismiss: 6,
        action: {
            label: 'Accept',
            callback: () => {
                socket.emit('action', {
                    type: 'server/accept-draw',
                    payload: {
                        roomName: data.thread
                    }
                });
            }
        }
    };
    store.dispatch(Notifications.info(notif));
});

ReactDOM.render(
    <Provider store={store}>
    <Router history={browserHistory} routes={routes}/>
</Provider>, document.querySelector('.container-fluid'));
