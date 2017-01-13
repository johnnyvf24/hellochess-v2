const initialState = []

export default function fourPlayerRooms(state = initialState, action) {
    switch(action.type) {
        case 'new-four-player-room':
            return action.payload;
        default:
            return state;
    }
}
