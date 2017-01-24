import {
    SIT_DOWN_BOARD
} from './types';

export function sitDownBoard(color, roomName, profile) {
    return {
        type: 'server/sit-down-board',
        payload: {
            color,
            roomName
        }
    }
}
