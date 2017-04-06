import {
    SELECTED_GAME_TYPE,
    SELECTED_TIME,
    SELECTED_TIME_INCREMENT,
    CREATE_GAME_ROOM,
    GAME_ROOM_NAME,
    ENABLE_VOICE_CHAT,
    RESET_NEW_GAME_MODAL,
    SET_MAX_PLAYERS,
    TOGGLE_PRIVATE
} from './types';

export function selectedGameType(value) {
    return {
        type: SELECTED_GAME_TYPE,
        payload: value
    }
}

export function selectedNewTime(value) {
    return {
        type: SELECTED_TIME,
        payload: value
    }
}

export function selectedNewTimeIncrement(value) {
    return {
        type: SELECTED_TIME_INCREMENT,
        payload: value
    }
}

export function createGameRoom() {
    return {
        type: CREATE_GAME_ROOM
    }
}

export function gameRoomNameChange(roomName) {
    return {
        type: GAME_ROOM_NAME,
        payload: roomName
    }
}

export function enableVoiceChat() {
    return {
        type: ENABLE_VOICE_CHAT
    }
}

export function resetNewGameModal() {
    return {
        type: RESET_NEW_GAME_MODAL
    }
}

export function changeMaxPlayers(value) {
    return {
        type: SET_MAX_PLAYERS,
        payload: value
    }
}

export function togglePrivate() {
    return {
        type: TOGGLE_PRIVATE
    }
}

//Sends a request to create a new game room
export function finalizeGameRoom(game, host) {
    delete game.isMakingGameRoom;
    delete host.email;
    game.host = host;
    return (dispatch) => {
        return dispatch({
            type: 'server/join-room',
            payload: game
        });
    }
}
