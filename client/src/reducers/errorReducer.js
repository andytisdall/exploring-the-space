import { ERROR } from '../actions/types';


export default (state = {}, action) => {
    switch (action.type) {
        case ERROR:
            return { error: action.payload }
        default:
            return state;
    }
};