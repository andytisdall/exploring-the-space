import greenhouse from '../apis/greenhouse';

import types from './types';




export const signIn = formValues => async (dispatch) => {
    const response = await greenhouse.post('/signin', formValue);
    dispatch({ type: types.SIGN_IN, payload: response.data});
    history.push('/');
};

export const signOut = () => async (dispatch) => {
    await greenhouse.get('/signout');
    dispatch({ type: types.SIGN_OUT });
    history.push('/');
};

export const signUp = formValues => async (dispatch) => {
    const response = await greenhouse.post('/signup', formValues);
    dispatch({ type: types.SIGN_UP, payload: response.data});
    history.push('/');
};




export const fetchBand = bandId => async (dispatch) => {
    const response = await greenhouse.get(`/bands/${bandId}`);
    dispatch({ type: types.FETCH_BAND, payload: response.data });
};

export const fetchBands = () => async (dispatch) => {
    const response = await greenhouse.get(`/bands`);
    dispatch({ type: types.FETCH_BANDS, payload: response.data });
};

export const fetchTiers = bandId => async (dispatch) => {
    const response = await greenhouse.get(`/tiers/${bandId}`);
    dispatch({ type: types.FETCH_TIERS, payload: response.data });
};

export const fetchTitles = tierId => async (dispatch) => {
    const response = await greenhouse.get(`/titles/${tierId}`);
    dispatch({ type: types.FETCH_TITLES, payload: response.data });
};

export const fetchVersions = titleId => async (dispatch) => {
    const response = await greenhouse.get(`/versions/${titleId}`);
    dispatch({ type: types.FETCH_VERSIONS, payload: response.data });
};

export const fetchBounces = versionId => async (dispatch) => {
    const response = await greenhouse.get(`/bounces/${versionId}`);
    dispatch({ type: types.FETCH_BOUNCES, payload: response.data });
};

export const fetchPlaylists = bandId => async (dispatch) => {
    const response = await greenhouse.get(`/playlists/${bandId}`);
    dispatch({ type: types.FETCH_PLAYLISTS, payload: response.data });
};

export const fetchPlaylistSongs = playlistId => async (dispatch) => {
    const response = await greenhouse.get(`/playlistsongs/${playlistId}`);
    dispatch({ type: types.FETCH_PLAYLISTSONGS, payload: response.data });
};





export const createBand = formValues => async dispatch => {
    const response = await greenhouse.post('/bands', formValues);
    dispatch({ type: types.CREATE_BAND, payload: response.data });
};

export const createTier = formValues => async dispatch => {
    const response = await greenhouse.post('/tiers', formValues);
    dispatch({ type: types.CREATE_TIER, payload: response.data });
};

export const createTitle = formValues => async dispatch => {
    const response = await greenhouse.post('/titles', formValues);
    dispatch({ type: types.CREATE_TITLE, payload: response.data });
};

export const createVersion = formValues => async dispatch => {
    const response = await greenhouse.post('/versions', formValues);
    dispatch({ type: types.CREATE_VERSION, payload: response.data });
};

export const createBounce = formValues => async dispatch => {
    const response = await greenhouse.post('/bounces', formValues);
    dispatch({ type: types.CREATE_BOUNCE, payload: response.data });
};

export const createPlaylist = formValues => async dispatch => {
    const response = await greenhouse.post('/playlists', formValues);
    dispatch({ type: types.CREATE_PLAYLIST, payload: response.data });
};

export const createPlaylistSong = formValues => async dispatch => {
    const response = await greenhouse.post('/playlistsong', formValues);
    dispatch({ type: types.CREATE_PLAYLISTSONG, payload: response.data });
};






export const editBand = formValues => async dispatch => {
    const response = await greenhouse.patch('/bands', formValues);
    dispatch({ type: types.EDIT_BAND, payload: response.data });
};

export const editTier = formValues => async dispatch => {
    const response = await greenhouse.patch('/tiers', formValues);
    dispatch({ type: types.EDIT_TIER, payload: response.data });
};

export const editTitle = formValues => async dispatch => {
    const response = await greenhouse.patch('/titles', formValues);
    dispatch({ type: types.EDIT_TITLE, payload: response.data });
};

export const editVersion = formValues => async dispatch => {
    const response = await greenhouse.patch('/versions', formValues);
    dispatch({ type: types.EDIT_VERSION, payload: response.data });
};

export const editBounce = formValues => async dispatch => {
    const response = await greenhouse.patch('/bounces', formValues);
    dispatch({ type: types.EDIT_BOUNCE, payload: response.data });
};

export const editPlaylist = formValues => async dispatch => {
    const response = await greenhouse.patch('/playlists', formValues);
    dispatch({ type: types.EDIT_PLAYLIST, payload: response.data });
};

export const editPlaylistSong = formValues => async dispatch => {
    const response = await greenhouse.patch('/playlistsong', formValues);
    dispatch({ type: types.EDIT_PLAYLISTSONG, payload: response.data });
};





export const deleteBand = bandId => async dispatch => {
    const response = await greenhouse.delete(`/bands/${bandId}`);
    dispatch({ type: types.DELETE_BAND, payload: response.data });
};

export const deleteTier = tierId => async dispatch => {
    const response = await greenhouse.delete(`/tiers/${tierId}`);
    dispatch({ type: types.DELETE_TIER, payload: response.data });
};

export const deleteTitle = titleId => async dispatch => {
    const response = await greenhouse.delete(`titles/${titleId}`);
    dispatch({ type: types.DELETE_TITLE, payload: response.data });
};

export const deleteVersion = versionId => async dispatch => {
    const response = await greenhouse.delete(`versions/${versionId}`);
    dispatch({ type: types.DELETE_VERSION, payload: response.data });
};

export const deleteBounce = bounceId => async dispatch => {
    const response = await greenhouse.delete(`bounces/${bounceId}`);
    dispatch({ type: types.DELETE_BOUNCE, payload: response.data });
};

export const deletePlaylist = playlistId => async dispatch => {
    const response = await greenhouse.delete(`playlists/${playlistId}`);
    dispatch({ type: types.DELETE_PLAYLIST, payload: response.data });
};

export const deletePlaylistSong = playlistSongId => async dispatch => {
    const response = await greenhouse.delete(`playlistsong/${playlistSongId}`);
    dispatch({ type: types.DELETE_PLAYLISTSONG, payload: response.data });
};

