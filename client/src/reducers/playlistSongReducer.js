import { FETCH_PLAYLISTSONGS, CREATE_PLAYLISTSONG, EDIT_PLAYLISTSONG, DELETE_PLAYLISTSONG, DELETE_TITLE, DELETE_VERSION, DELETE_BOUNCE } from '../actions/types';
import _ from 'lodash';

export default (state = {}, action) => {

    switch (action.type) {

        case FETCH_PLAYLISTSONGS:
            return { ...state, ..._.mapKeys(action.payload, 'id') };
        case CREATE_PLAYLISTSONG:
            return { ...state, [action.payload.playlistsong.id]: action.payload.playlistsong };
        case EDIT_PLAYLISTSONG:
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
        case DELETE_PLAYLISTSONG:
            const changePosition = Object.values(state).filter(p => p.position > action.payload.position);
            changePosition.forEach((song) => {
                song.position = song.position - 1;
            });
            delete state[action.payload.playlistsong.id];
            return { ...state };
        case DELETE_TITLE:
            const toDelete = Object.values(state).filter(pls => pls.title.id === action.payload.title.id);
            toDelete.forEach(pls => {
                delete state[pls.id];
            });
            return { ...state };
        case DELETE_VERSION:
            for (const song in state) {
                if (song.version === action.payload.version.id) {
                    song.version = null;
                    song.bounce = null;
                }
            }
            return { ...state };
        case DELETE_BOUNCE:
            for (const song in state) {
                if (song.bounce === action.payload.bounce.id) {
                    song.bounce = null;
                }
            }
            return { ...state };
        default:
            return state;

    }

};