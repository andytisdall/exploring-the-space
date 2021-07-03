import { FETCH_TIERS, CREATE_TIER, EDIT_TIER, DELETE_TIER } from '../actions/types';
import _ from 'lodash';

export default (state = {}, action) => {

    switch (action.type) {

        case FETCH_TIERS:
            return { ...state, ..._.mapKeys(action.payload, 'id') };
        case CREATE_TIER:
            return { ...state, [action.payload.id]: action.payload };
        case EDIT_TIER:
            return { ...state, [action.payload.id]: action.payload };
        case DELETE_TIER:
            return _.omit(state, action.payload);
        default:
            return state;

    }

};