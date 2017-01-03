import { combineReducers } from 'redux';
import SocketReducer from './socket_reducer';
import AuthReducer from './auth_reducer';

const rootReducer = combineReducers({
  socket: SocketReducer,
  auth: AuthReducer,
});

export default rootReducer;
