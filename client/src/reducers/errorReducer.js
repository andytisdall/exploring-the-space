import { ERROR } from '../actions/types';


export default (state = {}, action) => {
    switch (action.type) {
        case ERROR:
            console.log(action.payload);
            return { error: action.payload }
        default:
            return state;
    }
};