import {
  FETCH_BOUNCES,
  CREATE_BOUNCE,
  EDIT_BOUNCE,
  DELETE_BOUNCE,
} from '../actions/types';
import _ from 'lodash';

const bounceReducer = (state = {}, action) => {
  switch (action.type) {
    case FETCH_BOUNCES:
      return { ...state, ..._.mapKeys(action.payload, 'id') };
    case CREATE_BOUNCE:
      return { ...state, [action.payload.bounce.id]: action.payload.bounce };
    case EDIT_BOUNCE:
      return { ...state, [action.payload.id]: action.payload };
    case DELETE_BOUNCE:
      delete state[action.payload.bounce.id];
      return { ...state };
    default:
      return state;
  }
};
export default bounceReducer;
