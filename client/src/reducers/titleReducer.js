import { FETCH_TITLES, CREATE_TITLE, EDIT_TITLE, DELETE_TITLE, SELECT_VERSION, SELECT_BOUNCE } from '../actions/types';
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
            const vTitle = action.payload.title;
            vTitle.selectedVersion = action.payload.version;
            return { ...state, [vTitle.id]: vTitle };
        case SELECT_BOUNCE:
            const bTitle = action.payload.title;
            bTitle.selectedBounce = action.payload.bounce;
            return { ...state, [bTitle.id]: bTitle }
        default:
            return state;

    }

};