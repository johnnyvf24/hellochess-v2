export function sitDownBoard(details) {
    return {
        type: 'server/sit-down-board',
        payload: details
    }
}

export function sitDownComputer(details) {
    return {
        type: 'server/sit-down-board',
        payload: details
    }
}

export function enableMic(thread) {
    return {
        type: 'voice/enable-voice',
        payload: thread
    }
}

export function disableMic(thread) {
    return {
        type: 'voice/disable-voice',
        payload: thread
    }
}

export function removeComputer(player, thread) {
    return {
        type: 'server/remove-ai-player',
        payload: {
            player,
            thread
        }
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

export function killAIs(roomName) {
    return {
        type: 'server/kill-ais',
        payload: roomName
    }
}

export function abort(roomName) {
    return {
        type: 'server/abort',
        payload: roomName
    }
}

export function changeActivePly(roomName, activePly) {
    return {
        type: 'change-active-ply',
        payload: {
            roomName: roomName,
            activePly: activePly
        }
    }
}
