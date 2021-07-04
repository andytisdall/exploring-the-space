import { FETCH_PLAYLISTS, FETCH_PLAYLIST, CREATE_PLAYLIST, EDIT_PLAYLIST, DELETE_PLAYLIST } from '../actions/types';
import _ from 'lodash';

export default (state = {}, action) => {

    switch (action.type) {

        case FETCH_PLAYLISTS:
            return { ...state, ..._.mapKeys(action.payload, 'id') };
        case FETCH_PLAYLIST:
            return { ...state, [action.payload.id]: action.payload };
        case CREATE_PLAYLIST:
            return { ...state, [action.payload.id]: action.payload };
        case EDIT_PLAYLIST:
            return { ...state, [action.payload.id]: action.payload };
        case DELETE_PLAYLIST:
            return _.omit(state, action.payload);
        default:
            return state;

    }

};