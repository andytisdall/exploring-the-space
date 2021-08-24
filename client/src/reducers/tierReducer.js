import { FETCH_TIERS, CREATE_TIER, EDIT_TIER, DELETE_TIER, CREATE_TITLE } from '../actions/types';
import _ from 'lodash';

export default (state = {}, action) => {

    switch (action.type) {

        case FETCH_TIERS:
            return { ...state, ..._.mapKeys(action.payload, 'id') };
        case CREATE_TIER:
            return { ...state, [action.payload.id]: action.payload };
        case EDIT_TIER:
            const oldPosition = state[action.payload.id]['position'];
            const newPosition = action.payload.position;
            let changedPositions = {};
            if (oldPosition > newPosition) {
                for (let item of Object.values(state)) {
                    if (item.position >= newPosition && item.position < oldPosition) {
                        const pos = item.position;
                        changedPositions[item.id] = { ...item, position: pos + 1};
                    }
                }
            }
            if (oldPosition < newPosition) {
                for (let item of Object.values(state)) {
                    if (item.position > oldPosition && item.position <= newPosition) {
                        const pos = item.position;
                        changedPositions[item.id] = { ...item, position: pos - 1};
                    }
                }
            }
            return { ...state, [action.payload.id]: action.payload, ...changedPositions };
        case DELETE_TIER:
            return _.omit(state, action.payload);
        case CREATE_TITLE:
            const tier = state[action.payload.tier];
            tier.trackList.push(action.payload.id);
            return { ...state, [tier.id]: tier };
        default:
            return state;

    }

};