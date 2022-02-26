import {
  FETCH_TITLES,
  EDIT_TITLE,
  CREATE_TITLE,
  DELETE_TITLE,
  SELECT_BOUNCE,
  SELECT_VERSION,
} from './types';
import { errorHandler } from './errors';
import greenhouse from '../apis/greenhouse';
import { deleteVersion } from '.';
import { deletePlaylistSong } from '.';

export const fetchTitles = (tierId) => async (dispatch) => {
  try {
    const response = await greenhouse.get(`/titles/${tierId}`);
    dispatch({ type: FETCH_TITLES, payload: response.data });
  } catch (err) {
    dispatch(errorHandler(err));
  }
};

export const createTitle =
  (formValues, tierId) => async (dispatch, getState) => {
    const { currentBand } = getState().bands;
    try {
      const response = await greenhouse.post('/titles', {
        ...formValues,
        currentBand: currentBand.id,
        tier: tierId,
      });
      dispatch({
        type: CREATE_TITLE,
        payload: { title: response.data, tier: tierId },
      });
    } catch (err) {
      dispatch(errorHandler(err));
    }
  };

export const editTitle =
  (formValues, titleId, tierId) => async (dispatch, getState) => {
    try {
      const { currentBand } = getState().bands;
      let changeTier = formValues.move;
      const response = await greenhouse.patch(`/titles/${titleId}`, {
        ...formValues,
        currentTier: tierId,
        currentBand: currentBand.id,
      });
      dispatch({
        type: EDIT_TITLE,
        payload: {
          title: response.data,
          tier: { new: changeTier, old: tierId },
        },
      });
    } catch (err) {
      dispatch(errorHandler(err));
    }
  };

export const deleteTitle = (titleId, tierId) => async (dispatch, getState) => {
  const { currentBand } = getState().bands;
  try {
    const response = await greenhouse.post('/titles/delete', {
      titleId,
      tierId,
      currentBand: currentBand.id,
    });
    response.data.versions.forEach((versionId) => {
      dispatch(deleteVersion(versionId, response.data.id));
    });
    const playlists = Object.values(getState().playlists);
    const playlistSongs = Object.values(getState().playlistSongs).filter(
      (pls) => pls.title === titleId
    );
    playlistSongs.forEach((pls) => {
      const playlist = playlists.find((pl) => pl.songs.includes(pls.id));
      dispatch(deletePlaylistSong(pls.id, playlist.id));
    });
    dispatch({
      type: DELETE_TITLE,
      payload: { title: response.data, tier: tierId },
    });
  } catch (err) {
    dispatch(errorHandler(err));
  }
};

export const selectVersion = (version, titleId) => {
  return { type: SELECT_VERSION, payload: { version, titleId } };
};

export const selectBounce = (bounce, titleId) => {
  return { type: SELECT_BOUNCE, payload: { bounce, titleId } };
};
