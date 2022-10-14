import {
  FETCH_PLAYLISTSONGS,
  EDIT_PLAYLISTSONG,
  CREATE_PLAYLISTSONG,
  DELETE_PLAYLISTSONG,
} from './types';
import greenhouse from '../apis/greenhouse';
import { errorHandler } from '.';

export const fetchPlaylistSongs = (playlistId) => async (dispatch) => {
  try {
    const response = await greenhouse.get(`/playlistsongs/${playlistId}`);
    dispatch({ type: FETCH_PLAYLISTSONGS, payload: response.data });
  } catch (err) {
    dispatch(errorHandler(err));
  }
};

export const createPlaylistSong =
  (formValues) => async (dispatch, getState) => {
    try {
      const { currentBand } = getState().bands;
      const response = await greenhouse.post('/playlistsongs', {
        ...formValues,
        currentBand: currentBand.id,
      });
      dispatch({
        type: CREATE_PLAYLISTSONG,
        payload: {
          playlistsong: response.data,
          playlist: formValues.playlistId,
        },
      });
    } catch (err) {
      dispatch(errorHandler(err));
    }
  };

export const editPlaylistSong =
  (formValues, playlistSongId) => async (dispatch, getState) => {
    try {
      // const playlistsong = getState().playlistSongs[playlistSongId];
      // const optimisticallyEditedPlaylistSong = {
      //   ...playlistsong,
      //   ...formValues,
      // };

      // dispatch({
      //   type: EDIT_PLAYLISTSONG,
      //   payload: {
      //     playlistsong: optimisticallyEditedPlaylistSong,
      //     playlist: formValues.playlistId,
      //   },
      // });

      const { currentBand } = getState().bands;
      const song = getState().playlistSongs[playlistSongId];
      if (formValues.move) {
        const newSong = {
          playlistId: formValues.move,
          title: song.title,
          version: song.version,
          bounce: song.bounce,
        };
        dispatch(createPlaylistSong(newSong));
      }
      const response = await greenhouse.patch(
        `/playlistsongs/${playlistSongId}`,
        { ...formValues, currentBand: currentBand.id }
      );
      dispatch({
        type: EDIT_PLAYLISTSONG,
        payload: {
          playlistsong: response.data,
          playlist: formValues.playlistId,
        },
      });
    } catch (err) {
      dispatch(errorHandler(err));
    }
  };

export const deletePlaylistSong =
  (playlistSongId, playlistId) => async (dispatch, getState) => {
    const { currentBand } = getState().bands;
    try {
      const response = await greenhouse.post('/playlistsongs/delete', {
        playlistSongId,
        playlistId,
        currentBand: currentBand.id,
      });
      dispatch({
        type: DELETE_PLAYLISTSONG,
        payload: { playlistsong: response.data, playlist: playlistId },
      });
    } catch (err) {
      dispatch(errorHandler(err));
    }
  };
