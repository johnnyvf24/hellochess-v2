import {combineReducers} from 'redux';
import error from './error_reducer';
import messages from './message_reducer';
import activeThread from './active_thread_reducer';
import existingChatRooms from './chat_rooms_reducer';
import threads from './threads_reducer';
import AuthReducer from './auth_reducer';
import {reducer as notifications} from 'react-notification-system-redux';

const rootReducer = combineReducers({
    error,          //will contain the error to show as a notification
    notifications,  //notification-center lib
    activeThread,   //the current Chat thread
    existingChatRooms,      //A list of all Open Chat Rooms
    threads,
    messages,
    auth: AuthReducer,
});

export default rootReducer;
