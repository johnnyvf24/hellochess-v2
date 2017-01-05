
const initialState = {
    data: []
}

function messages (state = initialState, action) {
    switch(action.type) {
        case 'receive-message':
            return {
                ...state,
                data: [...state.data, action.payload]
            }
        default:
            return state;
    }
}


export default messages;
