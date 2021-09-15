import { ERROR } from '../actions/types';


export default (state = {}, action) => {
    switch (action.type) {
        case ERROR:
            if (action.payload) {
                console.log(action.payload);
            }
            return { error: action.payload }
        default:
            return state;
    }
};