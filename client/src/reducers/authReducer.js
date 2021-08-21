import { SIGN_IN, SIGN_OUT, SIGN_UP, CREATE_BAND } from '../actions/types';

const INITIAL_STATE = {
    isSignedIn: false,
    user: null
};

export default (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case SIGN_UP:
            return { ...state, isSignedIn: true, user: action.payload };
        case SIGN_IN:
            return { ...state, isSignedIn: true, user: action.payload };
        case SIGN_OUT:
            return { ...state, isSignedIn: false, user: null };
        case CREATE_BAND:
            const { user } = state;
            user.bands.push(action.payload.id);
            return { ...state, user };
        default:
            return state;  
    } 
};
