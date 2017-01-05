import {combineReducers} from 'redux';
import messages from './message_reducer';
import chats from './chat_reducer';
import activeChat from './active_chat_reducer';
import AuthReducer from './auth_reducer';

const rootReducer = combineReducers({
    messages,
    activeChat,
    auth: AuthReducer,
});

export default rootReducer;
