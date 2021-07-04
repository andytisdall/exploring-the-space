import { FETCH_BAND, FETCH_BANDS, EDIT_BAND, DELETE_BAND, CREATE_BAND } from '../actions/types';
import _ from 'lodash';

export default (state = {}, action) => {

    switch (action.type) {
        case FETCH_BAND:
            return { ...state, [action.payload.id]: action.payload, currentBand: action.payload };
        case FETCH_BANDS:
            return { ...state, ..._.mapKeys(action.payload, 'id') };
        case CREATE_BAND:
            return { ...state, [action.payload.id]: action.payload };
        case EDIT_BAND:
            return { ...state, [action.payload.id]: action.payload };
        case DELETE_BAND:
            return _.omit(state, action.payload);
        default:
            return state;

    }

};