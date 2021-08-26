import { FETCH_TITLES, CREATE_TITLE, EDIT_TITLE, DELETE_TITLE, SELECT_VERSION, SELECT_BOUNCE, CREATE_VERSION, DELETE_VERSION } from '../actions/types';
import _ from 'lodash';

export default (state = {}, action) => {

    switch (action.type) {

        case FETCH_TITLES:
            return { ...state, ..._.mapKeys(action.payload, 'id') };
        case CREATE_TITLE:
            return { ...state, [action.payload.id]: action.payload };
        case EDIT_TITLE:
            return { ...state, [action.payload.id]: action.payload };
        case DELETE_TITLE:
            return _.omit(state, action.payload);
        case SELECT_VERSION:
            const versionTitle = state[action.payload.titleId];
            versionTitle.selectedVersion = action.payload.version;
            return { ...state, [versionTitle.id]: versionTitle };
        case SELECT_BOUNCE:
            const bounceTitle = state[action.payload.titleId];
            bounceTitle.selectedBounce = action.payload.bounce;
            return { ...state, [bounceTitle.id]: bounceTitle }
        case CREATE_VERSION:
            const addToTitle = state[action.payload.title];
            addToTitle.versions.push(action.payload.id);
            return { ...state, [addToTitle.id]: addToTitle};
        case DELETE_VERSION:
            const deleteFromTitle = state[action.payload.title];
            const newVersionList = deleteFromTitle.versions.filter(id => id !== action.payload.id);
            deleteFromTitle.versions = newVersionList;
            return { ...state, [deleteFromTitle.id]: deleteFromTitle };
        default:
            return state;

    }

};