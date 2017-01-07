
function activeThread (state = {}, action) {
    switch(action.type) {
        case 'joined-chatroom':
            return action.payload;
        default:
            return state;
    }
}
