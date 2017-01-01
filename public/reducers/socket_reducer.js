export default (state = {
    messages: []
}, action) => {
    switch(action.type) {
        case 'receive-message':
            return {
                ...state,
                messages: [...state.messages, action.payload]
            }
        default:
            return state;
    }
}
