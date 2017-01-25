const initialState = [];

export default function rooms(state = initialState, action) {
    switch(action.type) {
        case 'all-rooms':
            return action.payload;
        case 'reconnect':
            return initialState;
        default:
            return state;
    }
}
