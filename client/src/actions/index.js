import greenhouse from '../apis/greenhouse';
import {
    SIGN_IN,
    SIGN_OUT,
    SIGN_UP,
    FETCH_BAND,
    FETCH_BANDS,
    FETCH_TIERS,
    FETCH_TITLES,
    FETCH_VERSIONS,
    FETCH_BOUNCES,
    FETCH_PLAYLISTS,
    FETCH_PLAYLISTSONGS,
    CREATE_BAND,
    CREATE_TIER,
    CREATE_TITLE,
    CREATE_VERSION,
    CREATE_BOUNCE,
    CREATE_PLAYLIST,
    CREATE_PLAYLISTSONG,
    EDIT_BAND,
    EDIT_TIER,
    EDIT_TITLE,
    EDIT_VERSION,
    EDIT_BOUNCE,
    EDIT_PLAYLIST,
    EDIT_PLAYLISTSONG,
    DELETE_BAND,
    DELETE_TIER,
    DELETE_TITLE,
    DELETE_VERSION,
    DELETE_BOUNCE,
    DELETE_PLAYLIST,
    DELETE_PLAYLISTSONG,
    PLAY_AUDIO,
    PAUSE_AUDIO,
    CHANGE_VOLUME,
    QUEUE_SONGS
} from './types';




export const signIn = formValues => async (dispatch) => {
    const response = await greenhouse.post('/signin', formValues);
    dispatch({ type: SIGN_IN, payload: response.data});
    // history.push('/');
};

export const signOut = () => async (dispatch) => {
    await greenhouse.get('/signout');
    dispatch({ type: SIGN_OUT });
    // history.push('/');
};

export const signUp = formValues => async (dispatch) => {
    const response = await greenhouse.post('/signup', formValues);
    dispatch({ type: SIGN_UP, payload: response.data});
    // history.push('/');
};




export const fetchBand = bandName => async (dispatch) => {
    const response = await greenhouse.get(`/bands/${bandName}`);
    
    dispatch({ type: FETCH_BAND, payload: response.data });
};

export const fetchBands = () => async (dispatch) => {
    const response = await greenhouse.get(`/bands`);
    dispatch({ type: FETCH_BANDS, payload: response.data });
};

export const fetchTiers = bandId => async (dispatch) => {
    const response = await greenhouse.get(`/tiers/${bandId}`);
    dispatch({ type: FETCH_TIERS, payload: response.data });
};

export const fetchTitles = tierId => async (dispatch) => {
    const response = await greenhouse.get(`/titles/${tierId}`);
    dispatch({ type: FETCH_TITLES, payload: response.data });
};

export const fetchVersions = titleId => async (dispatch) => {
    const response = await greenhouse.get(`/versions/${titleId}`);
    dispatch({ type: FETCH_VERSIONS, payload: response.data });
};

export const fetchBounces = versionId => async (dispatch) => {
    const response = await greenhouse.get(`/bounces/${versionId}`);
    dispatch({ type: FETCH_BOUNCES, payload: response.data });
};

export const fetchPlaylists = bandId => async (dispatch) => {
    const response = await greenhouse.get(`/playlists/${bandId}`);
    dispatch({ type: FETCH_PLAYLISTS, payload: response.data });
};

export const fetchPlaylistSongs = playlistId => async (dispatch) => {
    const response = await greenhouse.get(`/playlistsongs/${playlistId}`);
    dispatch({ type: FETCH_PLAYLISTSONGS, payload: response.data });
};





export const createBand = formValues => async dispatch => {
    const response = await greenhouse.post('/bands', formValues);
    dispatch({ type: CREATE_BAND, payload: response.data });
};

export const createTier = formValues => async dispatch => {
    const response = await greenhouse.post('/tiers', formValues);
    dispatch({ type: CREATE_TIER, payload: response.data });
};

export const createTitle = formValues => async dispatch => {
    const response = await greenhouse.post('/titles', formValues);
    dispatch({ type: CREATE_TITLE, payload: response.data });
};

export const createVersion = formValues => async dispatch => {
    const response = await greenhouse.post('/versions', formValues);
    dispatch({ type: CREATE_VERSION, payload: response.data });
};

export const createBounce = formValues => async dispatch => {
    const response = await greenhouse.post('/bounces', formValues);
    dispatch({ type: CREATE_BOUNCE, payload: response.data });
};

export const createPlaylist = formValues => async dispatch => {
    const response = await greenhouse.post('/playlists', formValues);
    dispatch({ type: CREATE_PLAYLIST, payload: response.data });
};

export const createPlaylistSong = formValues => async dispatch => {
    const response = await greenhouse.post('/playlistsong', formValues);
    dispatch({ type: CREATE_PLAYLISTSONG, payload: response.data });
};






export const editBand = formValues => async dispatch => {
    const response = await greenhouse.patch('/bands', formValues);
    dispatch({ type: EDIT_BAND, payload: response.data });
};

export const editTier = formValues => async dispatch => {
    const response = await greenhouse.patch('/tiers', formValues);
    dispatch({ type: EDIT_TIER, payload: response.data });
};

export const editTitle = formValues => async dispatch => {
    const response = await greenhouse.patch('/titles', formValues);
    dispatch({ type: EDIT_TITLE, payload: response.data });
};

export const editVersion = formValues => async dispatch => {
    const response = await greenhouse.patch('/versions', formValues);
    dispatch({ type: EDIT_VERSION, payload: response.data });
};

export const editBounce = formValues => async dispatch => {
    const response = await greenhouse.patch('/bounces', formValues);
    dispatch({ type: EDIT_BOUNCE, payload: response.data });
};

export const editPlaylist = formValues => async dispatch => {
    const response = await greenhouse.patch('/playlists', formValues);
    dispatch({ type: EDIT_PLAYLIST, payload: response.data });
};

export const editPlaylistSong = formValues => async dispatch => {
    const response = await greenhouse.patch('/playlistsong', formValues);
    dispatch({ type: EDIT_PLAYLISTSONG, payload: response.data });
};





export const deleteBand = bandId => async dispatch => {
    const response = await greenhouse.delete(`/bands/${bandId}`);
    dispatch({ type: DELETE_BAND, payload: response.data });
};

export const deleteTier = tierId => async dispatch => {
    const response = await greenhouse.delete(`/tiers/${tierId}`);
    dispatch({ type: DELETE_TIER, payload: response.data });
};

export const deleteTitle = titleId => async dispatch => {
    const response = await greenhouse.delete(`titles/${titleId}`);
    dispatch({ type: DELETE_TITLE, payload: response.data });
};

export const deleteVersion = versionId => async dispatch => {
    const response = await greenhouse.delete(`versions/${versionId}`);
    dispatch({ type: DELETE_VERSION, payload: response.data });
};

export const deleteBounce = bounceId => async dispatch => {
    const response = await greenhouse.delete(`bounces/${bounceId}`);
    dispatch({ type: DELETE_BOUNCE, payload: response.data });
};

export const deletePlaylist = playlistId => async dispatch => {
    const response = await greenhouse.delete(`playlists/${playlistId}`);
    dispatch({ type: DELETE_PLAYLIST, payload: response.data });
};

export const deletePlaylistSong = playlistSongId => async dispatch => {
    const response = await greenhouse.delete(`playlistsong/${playlistSongId}`);
    dispatch({ type: DELETE_PLAYLISTSONG, payload: response.data });
};

export const playAudio = () => {
    return { type: PLAY_AUDIO };
};

export const pauseAudio = () => {
    return { type: PAUSE_AUDIO };
};

export const queueSongs = song => (dispatch, getState) => {

    const allTitles = song.tier.trackList.map(id => getState().titles[id]);
    const titleList = allTitles.splice(allTitles.indexOf(song.title));
    const queue = titleList.map(title => {
        const version = title.versions.map(id => getState().versions[id]).find(v => v.current);
        const bounce = version.bounces.map(id => getState().bounces[id]).find(b => b.latest);
        return {
            title: title.title,
            version: version.name,
            date: bounce.date,
            duration: bounce.duration,
            audio: bounce.id
        };
    });
    dispatch({ type: QUEUE_SONGS, payload: queue });
};