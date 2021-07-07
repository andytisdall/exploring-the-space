import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';
import authReducer from './authReducer';
import tierReducer from './tierReducer';
import titleReducer from './titleReducer';
import versionReducer from './versionReducer';
import bounceReducer from './bounceReducer';
import playlistReducer from './playlistReducer';
import playlistSongReducer from './playlistSongReducer';
import bandReducer from './bandReducer';
import errorReducer from './errorReducer';
import audioReducer from './audioReducer';

export default combineReducers({
    form: formReducer,
    auth: authReducer,
    tiers: tierReducer,
    titles: titleReducer,
    versions: versionReducer,
    bounces: bounceReducer,
    playlists: playlistReducer,
    playlistSongs: playlistSongReducer,
    bands: bandReducer,
    errors: errorReducer,
    audio: audioReducer
});