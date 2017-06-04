import {VIEW_PROFILE, PLAYERLIST_SUCCESS, VIEW_LEADERBOARD, RECENT_GAMES, PLAYERLIST_DONE} from '../actions/types';

export default function currentProfile(state = {}, action) {
    switch(action.type) {
        case VIEW_PROFILE:
            return action.payload;
        case 'CLEAR_CURRENT_PROFILE':
            return {};
        default:
            return state;
    }
}

export function playerList(state = {
    players: [],
    hasMore: true,
}, action) {
    let newState = null;
    switch(action.type) {
        case PLAYERLIST_SUCCESS:
            newState = Object.assign({}, state);
            newState.players = newState.players.concat(action.payload);
            return newState;
        case PLAYERLIST_DONE:
            newState = Object.assign({}, state);
            newState.hasMore = false;
            return newState;
        default:
            return state;
    }
}

export function leaderboard(state = {}, action) {
    switch(action.type) {
        case VIEW_LEADERBOARD:
            return action.payload;
        default:
            return state;
    }
}

export function recentGames(state = [], action) {

    switch (action.type) {
        case RECENT_GAMES:
            return action.payload;
        case 'CLEAR_RECENT_GAMES':
            return [];
        default:
            return state;
    }
}

export function matchmaking(state = {
    searching: false,
}, action) {
    switch(action.type) {
        case 'in-queue':
            return {
                searching: true,
                timeControl: action.payload.timeControl,
                increment: action.payload.increment,
                gameType: action.payload.gameType,
            };
        case 'stopped-pairing':
            let newState = Object.assign({}, state);
            newState.searching = false;
            return newState;
        default:
            return state;
    }
}
