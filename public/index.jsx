import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {createStore, applyMiddleware} from 'redux';
import {Router, browserHistory} from 'react-router';
import ReduxPromise from 'redux-promise';
import socketIoMiddleware from './middleware/socketio';
import thunkMiddleware from 'redux-thunk'
import api from './middleware/api'

import reducers from './reducers';
import routes from './routes';

let createStoreWithMiddleware = applyMiddleware(ReduxPromise, thunkMiddleware, api, socketIoMiddleware)(createStore);
let store = createStoreWithMiddleware(reducers);

store.subscribe(() => {
    console.log('new client state', store.getState());
});

ReactDOM.render(
    <Provider store={store}>
    <Router history={browserHistory} routes={routes}/>
</Provider>, document.querySelector('.container-fluid'));
