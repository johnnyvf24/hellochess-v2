
const initialState = []

export default function existingChatRooms(state = initialState, action) {
    switch(action.type) {
        case 'new-chatroom':
            return action.payload;
        default:
            return state;
    }
}
