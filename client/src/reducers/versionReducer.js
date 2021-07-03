import { FETCH_VERSIONS, CREATE_VERSION, EDIT_VERSION, DELETE_VERSION } from '../actions/types';
import _ from 'lodash';

export default (state = {}, action) => {

    switch (action.type) {

        case FETCH_VERSIONS:
            return { ...state, ..._.mapKeys(action.payload, 'id') };
        case CREATE_VERSION:
            return { ...state, [action.payload.id]: action.payload };
        case EDIT_VERSION:
            return { ...state, [action.payload.id]: action.payload };
        case DELETE_VERSION:
            return _.omit(state, action.payload);
        default:
            return state;

    }

};