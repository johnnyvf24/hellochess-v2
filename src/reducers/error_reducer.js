import { CLEAR_ERROR } from '../actions'


const initialState = {
    error: ''
}

export default function error(state = initialState, action) {
    switch(action.type) {
        case 'error':
            return {
                error: action.payload.error
            }
        case CLEAR_ERROR:
            return {
                error: ''
            }
        default:
            return state;
    }
}
