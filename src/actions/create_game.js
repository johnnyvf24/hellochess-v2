import {
    SELECTED_GAME_TYPE,
    SELECTED_TIME,
    SELECTED_TIME_INCREMENT,
    CREATE_GAME_ROOM,
    GAME_ROOM_NAME,
    ENABLE_VOICE_CHAT,
    RESET_NEW_GAME_MODAL
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
