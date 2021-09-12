import { FETCH_PLAYLISTSONGS, CREATE_PLAYLISTSONG, EDIT_PLAYLISTSONG, DELETE_PLAYLISTSONG, DELETE_TITLE, DELETE_VERSION, DELETE_BOUNCE } from '../actions/types';
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
        case DELETE_TITLE:
            const toDelete = Object.values(state).filter(pls => pls.title.id === action.payload.title.id);
            toDelete.forEach(pls => {
                delete state[pls.id];
            });
            return { ...state };
        case DELETE_VERSION:
            for (const song in state) {
                if (song.version.id === action.payload.version.id) {
                    song.version = null;
                    song.bounce = null;
                }
            }
            return { ...state };
        case DELETE_BOUNCE:
            for (const song in state) {
                if (song.bounce.id === action.payload.bounce.id) {
                    song.bounce = null;
                }
            }
            return { ...state };
        default:
            return state;

    }

};