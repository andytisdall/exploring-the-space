import { FETCH_PLAYLISTSONGS, CREATE_PLAYLISTSONG, EDIT_PLAYLISTSONG, DELETE_PLAYLISTSONG } from '../actions/types';
import _ from 'lodash';

export default (state = {}, action) => {

    switch (action.type) {

        case FETCH_PLAYLISTSONGS:
            return { ...state, ..._.mapKeys(action.payload, 'id') };
        case CREATE_PLAYLISTSONG:
            return { ...state, [action.payload.id]: action.payload };
        case EDIT_PLAYLISTSONG:
            return { ...state, [action.payload.id]: action.payload };
        case DELETE_PLAYLISTSONG:
            return _.omit(state, action.payload);
        default:
            return state;

    }

};