import greenhouse from '../apis/greenhouse';
import {
    SIGN_IN,
    SIGN_OUT,
    SIGN_UP,
    ERROR,
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
    QUEUE_SONGS,
    NEXT_SONG,
    SELECT_VERSION,
    SELECT_BOUNCE
} from './types';
import history from '../history';


export const signIn = formValues => async (dispatch) => {
    try {
        const response = await greenhouse.post('/signin', formValues);
        localStorage.setItem('token', response.data.token );
        dispatch({ type: SIGN_IN, payload: response.data.user });
        history.push('/user');
    } catch (err) {
        dispatch({ type: ERROR, payload: err });
    }
};

export const signOut = () => {
    localStorage.removeItem('token'); 
    return { type: SIGN_OUT };
};

export const signUp = formValues => async (dispatch) => {
    try {
        const response = await greenhouse.post('/signup', formValues);
        localStorage.setItem('token', response.data.token );
        dispatch({ type: SIGN_IN, payload: response.data.user });
        history.push('/user');
    } catch (err) {
        dispatch({ type: ERROR, payload: err });
    }
};

export const fetchUser = () => async dispatch => {
    const response = await greenhouse.get('/user');
    if (response.data) {
        dispatch({ type: SIGN_IN, payload: response.data });
    }
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
    try {
        const response = await greenhouse.get(`/tiers/${bandId}`);
        dispatch({ type: FETCH_TIERS, payload: response.data });
    } catch (err) {
        dispatch({ type: ERROR, payload: err });
    }
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



export const createBand = formValues => async (dispatch) => {
    const response = await greenhouse.post('/bands', formValues);
    dispatch({ type: CREATE_BAND, payload: response.data });
};

export const createTier = formValues => async (dispatch, getState) => {
    try {
        const { currentBand } = getState().bands;
        const response = await greenhouse.post(
            '/tiers',
            { ...formValues, currentBand: currentBand.id }
        );
        dispatch({ type: CREATE_TIER, payload: response.data });
        } catch (err) {
            dispatch({ type: ERROR, payload: err });
        }
};

export const createTitle = (formValues, tierId) => async (dispatch, getState) => {
    const { currentBand } = getState().bands;
    try {
        const response = await greenhouse.post(
            '/titles',
            { ...formValues, currentBand: currentBand.id, tier: tierId }
        );
        dispatch({ type: CREATE_TITLE, payload: { ...response.data, tier: tierId } });
    } catch (err) {
        dispatch( {type: ERROR, payload: err});
    }
};

export const createVersion = (formValues, titleId) => async (dispatch, getState) => {
    const { currentBand } = getState().bands;
    try {
        const response = await greenhouse.post(
            '/versions',
            { ...formValues, currentBand: currentBand.id, title: titleId }
        );
        dispatch({ type: CREATE_VERSION, payload: { ...response.data, title: titleId } });
        if (response.data.current) {
            dispatch({ type: SELECT_VERSION, payload: { titleId, version: response.data } });
        }
    } catch (err) {
        dispatch( {type: ERROR, payload: err});
    }
};

export const createBounce = formValues => async dispatch => {
    try {
        const response = await greenhouse.post(
            '/bounces', 
            formValues,
            { headers:
                { 'Content-Type': 'multipart/form-data'}
            }
        );
        dispatch({ type: CREATE_BOUNCE, payload: response.data });
    } catch (err) {
        dispatch( {type: ERROR, payload: err});
    }
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

export const editTier = (formValues, tierId) => async (dispatch, getState) => {
    try {
        const { currentBand } = getState().bands;
        const response = await greenhouse.patch(
            `/tiers/${tierId}`,
            { ...formValues, currentBand: currentBand.id }
        );
        dispatch({ type: EDIT_TIER, payload: response.data });
    } catch (err) {
        dispatch({ type: ERROR, payload: err });
    }
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

export const deleteTier = tierId => async (dispatch, getState) => {
    const { currentBand } = getState().bands;
    try {
        const response = await greenhouse.post(
            '/tiers/delete',
            {
                tierId,
                currentBand: currentBand.id
            }
        );
        dispatch({ type: DELETE_TIER, payload: response.data });
    } catch (err) {
        dispatch( {type: ERROR, payload: err});
    }
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

export const queueSongs = (song) => (dispatch, getState) => {

    const allTitles = song.tier.trackList.map(id => getState().titles[id]);
    const titleList = allTitles.splice(allTitles.indexOf(song.title));
    const queue = titleList.map(title => {
        const version = getState().versions[title.selectedVersion.id];
        const bounce = getState().bounces[title.selectedBounce.id];
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

export const queuePlaylistSongs = (song) => (dispatch, getState) => {
    console.log('ok);')

    const allSongs = song.playlist.songs.map(id => getState().playlistSongs[id]);
    const songList = allSongs.splice(allSongs.indexOf(song.self));
    const queue = songList.map(song => {
        const title = getState().titles[song.title];
        const version = getState().versions[song.version];
        const bounce = getState().bounces[song.bounce];
        return {
            title: song.title.title,
            version: song.version.name,
            date: song.bounce.date,
            duration: song.bounce.duration,
            audio: song.bounce.id
        };
    });
    dispatch({ type: QUEUE_SONGS, payload: queue });
};


export const nextSong = () => dispatch => {
    dispatch({ type: NEXT_SONG });
}


export const selectVersion = (version, titleId) => {
    return { type: SELECT_VERSION, payload: { version, titleId } };
}

export const selectBounce = (bounce, titleId) => {
    return { type: SELECT_BOUNCE, payload: { bounce, titleId } };
}