import { combineReducers } from 'redux';
import SocketReducer from './socket_reducer';

const rootReducer = combineReducers({
  socket: SocketReducer
});

export default rootReducer;
