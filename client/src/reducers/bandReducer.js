import { FETCH_BAND, FETCH_BANDS, EDIT_BAND, DELETE_BAND, CREATE_BAND, CREATE_TIER, DELETE_TIER } from '../actions/types';
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
        case CREATE_TIER:
            const { currentBand } = state;
            currentBand.tiers.push(action.payload.id);
            return { ...state, [currentBand.id]: currentBand, currentBand };
        case DELETE_TIER:
            const band = state.currentBand;
            const newTiers = band.tiers.filter(id => id !== action.payload.id);
            band.tiers = newTiers;
            return { ...state, [band.id]: band, currentBand: band };
        default:
            return state;

    }

};