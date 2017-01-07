import {combineReducers} from 'redux';
import error from './error_reducer';
import existingChatRooms from './chat_rooms_reducer';
import threads from './threads_reducer';
import AuthReducer from './auth_reducer';
import {reducer as notifications} from 'react-notification-system-redux';

function activeThread (state, action) {
    return 'global';
}

function openThreads(state, action) {
    return {
        "global": {
            name: 'global',
            messages: [{
                    at: 'UTCTime',
                    username: 'bob',
                    message: 'hello'
                },
                {
                    at: 'UTCTime',
                    username: 'joi',
                    message: 'hi'
                },
                {
                    at: 'UTCTime',
                    username: 'angie',
                    message: 'I am awesome at building stuff'
                }
            ],
            users: ['bob', 'bill', 'angie']
        },
        "test": {
            name: 'test',
            messages: [{
                    at: 'UTCTime',
                    username: 'lightning',
                    message: 'fart'
                },
                {
                    at: 'UTCTime',
                    username: 'tough',
                    message: 'haha'
                },
                {
                    at: 'UTCTime',
                    username: 'dark',
                    message: 'I am awesome at building stuff'
                }
            ],
            users: ['dark', 'tough', 'lightning']
        }
    }
}


const rootReducer = combineReducers({
    error,          //will contain the error to show as a notification
    notifications,  //notification-center lib
    existingChatRooms,      //A list of all Open Chat Rooms
    activeThread,
    openThreads,
    auth: AuthReducer,
});

export default rootReducer;
