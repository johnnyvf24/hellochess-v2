import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {createStore, applyMiddleware} from 'redux';
import {Router, browserHistory} from 'react-router';
import ReduxPromise from 'redux-promise';
import createSocketIoMiddleware from 'redux-socket.io';
import io from 'socket.io-client';

import reducers from './reducers';
import routes from './routes';

let socket = io('http://localhost:3000');
let socketIoMiddleware = createSocketIoMiddleware(socket, "server/");

let store = applyMiddleware(ReduxPromise, socketIoMiddleware)(createStore)(reducers);

store.subscribe(() => {
    console.log('new client state', store.getState());
});

ReactDOM.render(
    <Provider store={store}>
    <Router history={browserHistory} routes={routes}/>
</Provider>, document.querySelector('.container-fluid'));
