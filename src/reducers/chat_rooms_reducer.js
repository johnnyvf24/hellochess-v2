
const initialState = []

export default function existingChatRooms(state = initialState, action) {
    switch(action.type) {
        case 'all-chatrooms':
            return action.payload;
        default:
            return state;
    }
}
