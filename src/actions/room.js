export function sitDownBoard(details) {
    return {
        type: 'server/sit-down-board',
        payload: details
    }
}

export function newMove(move, roomName) {
    return {
        type: 'server/new-move',
        payload: {
            thread: roomName,
            move: move
        }
    }

}
