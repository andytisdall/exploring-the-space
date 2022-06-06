import {
  FETCH_PLAYLISTS,
  CREATE_PLAYLIST,
  EDIT_PLAYLIST,
  DELETE_PLAYLIST,
} from './types';
import { errorHandler } from './errors';
import greenhouse from '../apis/greenhouse';
import { deletePlaylistSong } from '.';

export const fetchPlaylists = (bandId) => async (dispatch) => {
  try {
    const response = await greenhouse.get(`/playlists/${bandId}`);
    dispatch({ type: FETCH_PLAYLISTS, payload: response.data });
  } catch (err) {
    dispatch(errorHandler(err));
  }
};

export const createPlaylist = (formValues) => async (dispatch, getState) => {
  try {
    const { currentBand } = getState().bands;
    const response = await greenhouse.post('/playlists', {
      ...formValues,
      currentBand: currentBand.id,
    });
    dispatch({ type: CREATE_PLAYLIST, payload: response.data });
  } catch (err) {
    dispatch(errorHandler(err));
  }
};

export const editPlaylist =
  (formValues, playlistId) => async (dispatch, getState) => {
    try {
      const playlist = getState().playlists[playlistId];
      const optimisticallyEditedPlaylist = {
        ...playlist,
        ...formValues,
      };
      dispatch({ type: EDIT_PLAYLIST, payload: optimisticallyEditedPlaylist });
      const { currentBand } = getState().bands;
      const response = await greenhouse.patch(`/playlists/${playlistId}`, {
        ...formValues,
        currentBand: currentBand.id,
      });
      dispatch({ type: EDIT_PLAYLIST, payload: response.data });
    } catch (err) {
      dispatch(errorHandler(err));
    }
  };

export const deletePlaylist = (playlistId) => async (dispatch, getState) => {
  const { currentBand } = getState().bands;
  try {
    const response = await greenhouse.post('/playlists/delete', {
      playlistId,
      currentBand: currentBand.id,
    });
    response.data.songs.forEach((playlistSongId) => {
      dispatch(deletePlaylistSong(playlistSongId, response.data.id));
    });
    dispatch({ type: DELETE_PLAYLIST, payload: response.data });
  } catch (err) {
    dispatch(errorHandler(err));
  }
};
