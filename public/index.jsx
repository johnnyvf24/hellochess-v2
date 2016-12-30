import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {createStore, applyMiddleware} from 'redux';
import {Router, browserHistory} from 'react-router';
import createSocketIoMiddleware from 'redux-socket.io';
import io from 'socket.io-client';

import reducers from './reducers';
import routes from './routes';

let socket = io('http://localhost:8080');
let socketIoMiddleware = createSocketIoMiddleware(socket, "server/");
function reducer(state = {}, action) {
    switch(action.type) {
        case 'message':
            return Object.assign({}, { message:action.data });
        default:
            return state;
    }
}

let store = applyMiddleware(socketIoMiddleware) (createStore) (reducer);
store.subscribe(() => {
    console.log('new client state', store.getState());
});
store.dispatch({type:'server/hello', data:'Hello!'});

const createStoreWithMiddleware = applyMiddleware()(createStore);

ReactDOM.render(
    <Provider store={createStoreWithMiddleware(reducers)}>
    <Router history={browserHistory} routes={routes}/>
</Provider>, document.querySelector('.container-fluid'));
