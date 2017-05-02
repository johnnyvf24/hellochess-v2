import * as ActionTypes from '../actions/types';

const initialState = {
    gameType: "four-player",
    time: {
        value: 10,
        increment: 3
    },
    isMakingGameRoom: false,
    room: {
        voiceChat: false,
        maxPlayers: 50,
        private: false
    }
}

export default function newGameOptions (state=initialState, action) {
    switch(action.type) {
        case ActionTypes.SELECTED_GAME_TYPE:
            return {...state, gameType: action.payload}
        case ActionTypes.SELECTED_TIME:
            return {...state, time: { ...state.time, value: action.payload } };
        case ActionTypes.SELECTED_TIME_INCREMENT:
            return {...state, time: { ...state.time, increment: action.payload } };
        case ActionTypes.CREATE_GAME_ROOM:
            return {...state, isMakingGameRoom: true};
        case ActionTypes.GAME_ROOM_NAME:
            return {...state, room: { ...state.room, name: action.payload}}
        case ActionTypes.ENABLE_VOICE_CHAT: {
            return {...state, room: { ...state.room, voiceChat: !state.room.voiceChat}}
        }
        case ActionTypes.RESET_NEW_GAME_MODAL:
            return initialState;
        case ActionTypes.SET_MAX_PLAYERS:
            return {...state, room: {...state.room, maxPlayers: action.payload}}
        case ActionTypes.TOGGLE_PRIVATE:
            return {...state, room: {...state.room, private: !state.room.private}}
        default:
            return state;
    }
}
