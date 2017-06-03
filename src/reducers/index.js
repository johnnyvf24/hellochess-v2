import {combineReducers} from 'redux';
import {reducer as notifications} from 'react-notification-system-redux';
import { reducer as formReducer } from 'redux-form';

import FourChess from '../../common/fourchess';
import rooms from './rooms_reducer';
import AuthReducer from './auth_reducer';
import newGameOptions from './new_game_reducer';
import currentProfile, {playerList, leaderboard, recentGames} from './profile_reducer';
import openThreads from './open_threads_reducer';

import {SELECTED_ROOM, LOGOUT_SUCCESS, CLOSE_ANALYSIS} from '../actions/types';

function activeThread (state = 'Global', action) {
    switch(action.type) {
        case SELECTED_ROOM:
            return action.payload;
        case LOGOUT_SUCCESS:
            return 'Games';
        default:
            return state;
    }
}


function connection(state = {status: false, error: false}, action) {
    switch(action.type) {
        case 'duplicate-login':
            return {status: false, error: true};
        case 'disconnect':
            return {status: false};
        case 'connected-user':
            return {status: true};
        default:
            return state;
    }
}

function settings(state = {}, action) {
    let newState = null;
    switch (action.type) {
        case 'change-zoom':
            newState = Object.assign({}, state);
            newState.zoomLevel = action.payload;
            return newState;
        default:
            return state;
    }
}

const rootReducer = combineReducers({
    connection,
    notifications,  //notification-center lib
    rooms,      //A list of all available Chat Rooms
    activeThread,
    openThreads,
    currentProfile,
    newGameOptions,
    leaderboard,
    auth: AuthReducer,
    form: formReducer,
    recentGames,
    playerList,
    settings
});

export default rootReducer;
