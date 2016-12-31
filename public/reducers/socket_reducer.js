export default (state = {}, action) => {
    switch(action.type) {
        case 'newmessage':
            return Object.assign({}, { message: action.payload });
        default:
            return state;
    }
}
