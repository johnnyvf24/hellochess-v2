import {combineReducers} from 'redux';
import error from './error_reducer';
import messages from './message_reducer';
import chat from './chat_reducer';
import openChats from './open_chats_reducer';
import activeChat from './active_chat_reducer';
import AuthReducer from './auth_reducer';
import {reducer as notifications} from 'react-notification-system-redux';

const rootReducer = combineReducers({
    notifications,
    error,
    messages,
    activeChat,
    openChats,
    chat,
    auth: AuthReducer,
});

export default rootReducer;
