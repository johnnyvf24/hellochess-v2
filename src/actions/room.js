export function sitDownBoard(details) {
    return {
        type: 'server/sit-down-board',
        payload: details
    }
}

export function tick(roomName, turn) {
    return {
        type: 'TICK',
        payload: {
            thread: roomName,
            turn: turn
        }
    }
}

export function fourNewMove(move, roomName) {
    return {
        type: 'server/four-new-move',
        payload: {
            thread: roomName,
            move: move
        }
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

export function draw(roomName) {
    return {
        type: 'server/draw',
        payload: {
            roomName
        }
    }
}

export function resign(playerId, roomName) {
    return {
        type: 'server/resign',
        payload: {
            playerId,
            roomName
        }
    }
}

export function fourResign(roomName) {
    return {
        type: 'server/four-resign',
        payload: {
            roomName
        }
    }
}

export function acceptDraw(roomName) {
    return {
        type: 'server/accept-draw',
        payload: {
            roomName
        }
    }
}
