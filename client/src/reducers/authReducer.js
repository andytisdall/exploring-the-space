import { SIGN_IN, SIGN_OUT, CREATE_BAND } from '../actions/types';

const INITIAL_STATE = {
  isSignedIn: false,
  user: null,
};

const authReducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
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

export default authReducer;
