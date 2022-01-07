import { FETCH_VERSIONS, CREATE_VERSION, EDIT_VERSION, DELETE_VERSION, CREATE_BOUNCE, DELETE_BOUNCE } from '../actions/types';
import _ from 'lodash';

export default (state = {}, action) => {

    switch (action.type) {

        case FETCH_VERSIONS:
            return { ...state, ..._.mapKeys(action.payload, 'id') };
        case CREATE_VERSION:
            return { ...state, [action.payload.version.id]: action.payload.version };
        case EDIT_VERSION:
            return { ...state, [action.payload.version.id]: action.payload.version };
        case DELETE_VERSION:
            delete state[action.payload.version.id];
            return { ...state };
        case CREATE_BOUNCE:
            const addToVersion = state[action.payload.version];
            addToVersion.bounces.push(action.payload.bounce.id);
            return { ...state, [addToVersion.id]: addToVersion};
        case DELETE_BOUNCE:
            const deleteFromVersion = state[action.payload.version];
            if (deleteFromVersion) {
                const newBounceList = deleteFromVersion.bounces.filter(id => id !== action.payload.bounce.id);
                deleteFromVersion.bounces = newBounceList;
                return { ...state, [deleteFromVersion.id]: deleteFromVersion };
            }
        default:
            return state;

    }

};