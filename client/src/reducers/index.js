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
import recordingReducer from './recordingReducer';
import { FETCH_BAND } from '../actions/types';

const appReducer = combineReducers({
  form: formReducer,
  auth: authReducer,
  tiers: tierReducer,
  titles: titleReducer,
  versions: versionReducer,
  bounces: bounceReducer,
  playlists: playlistReducer,
  playlistSongs: playlistSongReducer,
  bands: bandReducer,
  error: errorReducer,
  audio: audioReducer,
  recordings: recordingReducer,
});

// clear the store if we are loading a new band's data

export default (state, action) => {
  if (action.type === FETCH_BAND) {
    const clearedState = { auth: state.auth };
    return appReducer(clearedState, action);
  }
  return appReducer(state, action);
};
