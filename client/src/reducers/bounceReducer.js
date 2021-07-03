import { FETCH_BOUNCES, CREATE_BOUNCE, EDIT_BOUNCE, DELETE_BOUNCE } from '../actions/types';
import _ from 'lodash';

export default (state = {}, action) => {

    switch (action.type) {

        case FETCH_BOUNCES:
            return { ...state, ..._.mapKeys(action.payload, 'id')};
        case CREATE_BOUNCE:
            return { ...state, [action.payload.id]: action.payload };
        case EDIT_BOUNCE:
            return { ...state, [action.payload.id]: action.payload };
        case DELETE_BOUNCE:
            return _.omit(state, action.payload);
        default:
            return state;

    }

};