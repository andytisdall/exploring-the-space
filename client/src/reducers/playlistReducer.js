import { FETCH_PLAYLISTS, FETCH_PLAYLIST, CREATE_PLAYLIST, EDIT_PLAYLIST, DELETE_PLAYLIST, CREATE_PLAYLISTSONG, DELETE_PLAYLISTSONG } from '../actions/types';
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
        case DELETE_PLAYLIST:
            return _.omit(state, action.payload.playlist);
        case CREATE_PLAYLISTSONG:
            const addToPlaylist = state[action.payload.playlist];
            addToPlaylist.playlistsongs.push(action.payload.playlistsong.id);
            return { ...state, [addToPlaylist.id]: addToPlaylist};
        case DELETE_PLAYLISTSONG:
            const deleteFromPlaylist = state[action.payload.playlist];
            const newSongList = deleteFromPlaylist.playlistsongs.filter(id => id !== action.payload.playlistsong.id);
            deleteFromPlaylist.songs = newSongList;
            return { ...state, [deleteFromPlaylist.id]: deleteFromPlaylist };
        default:
            return state;

    }

};