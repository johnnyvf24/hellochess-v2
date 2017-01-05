
const initialState = []

function chat(state = initialState, action) {
    switch(action.type) {
        case 'new-chatroom':
            return action.payload;
        default:
            return state;
    }
}

export default chat
