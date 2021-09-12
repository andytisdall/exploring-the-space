import greenhouse from '../apis/greenhouse';
import {
    SIGN_IN,
    SIGN_OUT,
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
import _ from 'lodash';


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
    history.push('/');
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
        dispatch({ type: CREATE_TITLE, payload: { title: response.data, tier: tierId } });
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
        dispatch({ type: CREATE_VERSION, payload: { version: response.data, title: titleId } });
        if (response.data.current) {
            dispatch({ type: SELECT_VERSION, payload: { titleId, version: response.data } });
        }
    } catch (err) {
        dispatch( {type: ERROR, payload: err});
    }
};

export const createBounce = (formValues, versionId, titleId) => async (dispatch, getState) => {
    formValues.file = formValues.file[0];
    const { currentBand } = getState().bands;
    try {
        // Create instance of FileReader
        const reader = new FileReader();

        // When the file has been succesfully read
        reader.onload = event => {

            // Create an instance of AudioContext
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();

            // Asynchronously decode audio file data contained in an ArrayBuffer.
            audioContext.decodeAudioData(event.target.result, async (buffer) => {

                // Obtain the duration in seconds of the audio file (with milliseconds as well, a float value)
                const duration = parseInt(buffer.duration);

                const formObject = {
                    ...formValues,
                    currentBand: currentBand.id,
                    version: versionId,
                    duration
                }

                const formData = new FormData();

                for ( let key in formObject ) {
                    formData.append(key, formObject[key]);
                }

                const response = await greenhouse.post(
                    '/bounces', 
                    formData,
                    {
                        headers: { 'Content-Type': 'multipart/form-data'}
                    }
                );

                dispatch({ type: CREATE_BOUNCE, payload: { bounce: response.data, version: versionId } });
                if (response.data.latest) {
                    dispatch({ type: SELECT_BOUNCE, payload: { titleId, bounce: response.data } });
                }

            });
        };

        // In case the file couldn't be read
        reader.onerror =  event => {
            console.error("An error ocurred reading the file: ", event);
        };

        // Read file as an ArrayBuffer, important !
        reader.readAsArrayBuffer(formValues.file);

    } catch (err) {
        dispatch( {type: ERROR, payload: err});
    }
};

export const createPlaylist = formValues => async (dispatch, getState) => {
    try {
        const { currentBand } = getState().bands;
        const response = await greenhouse.post(
            '/playlists',
            { ...formValues, currentBand: currentBand.id }
        );
        dispatch({ type: CREATE_PLAYLIST, payload: response.data });
    } catch (err) {
        dispatch({ type: ERROR, payload: err });
    }
};

export const createPlaylistSong = (formValues, playlistId) => async (dispatch, getState) => {

    try {
        const { currentBand } = getState().bands;
        const response = await greenhouse.post(
            '/playlistsongs',
            { 
                ...formValues,
                playlist: playlistId,
                currentBand: currentBand.id
            }
        );
        dispatch({ type: CREATE_PLAYLISTSONG, payload: { playlistsong: response.data, playlist: playlistId } });
    } catch (err) {
        dispatch({ type: ERROR, payload: err });
    }
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

export const editTitle = (formValues, titleId) => async (dispatch, getState) => {
    try {
        const { currentBand } = getState().bands;
        const response = await greenhouse.patch(
            `/titles/${titleId}`,
            { ...formValues, currentBand: currentBand.id }
        );
        dispatch({ type: EDIT_TITLE, payload: response.data });
    } catch (err) {
        dispatch({ type: ERROR, payload: err });
    }
};

export const editVersion = (formValues, versionId) => async (dispatch, getState) => {
    try {
        const { currentBand } = getState().bands;
        const response = await greenhouse.patch(
            `/versions/${versionId}`,
            { ...formValues, currentBand: currentBand.id }
        );
        dispatch({ type: EDIT_VERSION, payload: response.data });
    } catch (err) {
        dispatch({ type: ERROR, payload: err });
    }
};

export const editBounce = (formValues, bounceId) => async (dispatch, getState) => {
    try {
        const { currentBand } = getState().bands;
        if (formValues.file[0]) {
            formValues.file = formValues.file[0];
 
            // Create instance of FileReader
            const reader = new FileReader();
    
            // When the file has been succesfully read
            reader.onload = event => {
    
                // Create an instance of AudioContext
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
                // Asynchronously decode audio file data contained in an ArrayBuffer.
                audioContext.decodeAudioData(event.target.result, async (buffer) => {
    
                    // Obtain the duration in seconds of the audio file (with milliseconds as well, a float value)
                    const duration = parseInt(buffer.duration);
    
                    const formObject = {
                        ...formValues,
                        currentBand: currentBand.id,
                        duration
                    }
    
                    const formData = new FormData();
    
                    for ( let key in formObject ) {
                        formData.append(key, formObject[key]);
                    }
    
                    const response = await greenhouse.post(
                        `/bounces${bounceId}`, 
                        formData,
                        {
                            headers: { 'Content-Type': 'multipart/form-data'}
                        }
                    );
    
                    dispatch({ type: EDIT_BOUNCE, payload: response.data });
    
                });
            };
    
            // In case the file couldn't be read
            reader.onerror =  event => {
                console.error("An error ocurred reading the file: ", event);
            };
    
            // Read file as an ArrayBuffer, important !
            reader.readAsArrayBuffer(formValues.file);
        } else {
            const response = await greenhouse.patch(
                `/bounces/${bounceId}`,
                { ...formValues, currentBand: currentBand.id }
            );
            dispatch({ type: EDIT_BOUNCE, payload: response.data });
        }
    } catch (err) {
        dispatch({ type: ERROR, payload: err });
    }
};

export const editPlaylist = (formValues, playlistId) => async (dispatch, getState) => {
    try {
        const { currentBand } = getState().bands;
        const response = await greenhouse.patch(
            `/playlists/${playlistId}`,
            { ...formValues, currentBand: currentBand.id }
        );
        dispatch({ type: EDIT_PLAYLIST, payload: response.data });
    } catch (err) {
        dispatch({ type: ERROR, payload: err });
    }
};

export const editPlaylistSong = (formValues, playlistSongId) => async (dispatch, getState) => {
    try {
        const { currentBand } = getState().bands;
        const response = await greenhouse.patch(
            `/playlistsongs/${playlistSongId}`,
            { ...formValues, currentBand: currentBand.id }
        );
        dispatch({ type: EDIT_PLAYLISTSONG, payload: response.data });
    } catch (err) {
        dispatch({ type: ERROR, payload: err });
    }
};





export const deleteBand = bandId => async dispatch => {
    try {
        const response = await greenhouse.post(
            '/bands/delete',
            { currentBand: bandId }
        );
        dispatch({ type: DELETE_BAND, payload: response.data });
    } catch (err) {
        dispatch( {type: ERROR, payload: err});
    }
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
        response.data.trackList.forEach(titleId => {
            dispatch(deleteTitle(titleId, response.data.id));
        });
        dispatch({ type: DELETE_TIER, payload: response.data });
    } catch (err) {
        dispatch( {type: ERROR, payload: err});
    }
};

export const deleteTitle = (titleId, tierId) => async (dispatch, getState) => {
    const { currentBand } = getState().bands;
    try {
        const response = await greenhouse.post(
            '/titles/delete',
            {
                titleId,
                tierId,
                currentBand: currentBand.id
            }
        );
        response.data.versions.forEach(versionId => {
            dispatch(deleteVersion(versionId, response.data.id));
        });
        dispatch({ type: DELETE_TITLE, payload: { title: response.data, tier: tierId } });
    } catch (err) {
        dispatch( {type: ERROR, payload: err});
    }
};

export const deleteVersion = (versionId, titleId) => async (dispatch, getState) => {
    const { currentBand } = getState().bands;
    try {
        const response = await greenhouse.post(
            '/versions/delete',
            {
                versionId,
                titleId,
                currentBand: currentBand.id
            }
        );
        if (response.data.current) {
            const parentTitle = getState().titles[titleId];
            if (parentTitle) {
                const versionList = parentTitle.versions.map(id => {
                    if (id !== versionId) {
                        return getState().versions[id];
                    }
                });
                const newCurrent = versionList[versionList.length -1];
                if (newCurrent) {
                    newCurrent.current = true;
                    dispatch(selectVersion(newCurrent.id, titleId));
                    dispatch(editVersion(
                        _.pick(newCurrent, 'name', 'notes', 'current'), newCurrent.id
                    ));
                } else {
                    dispatch(selectVersion(null, titleId));
                    
                }   
            }
        }
        response.data.bounces.forEach(bounceId => {
            dispatch(deleteBounce(bounceId, response.data.id));
        });
        dispatch({ type: DELETE_VERSION, payload: { version: response.data, title: titleId } });
    } catch (err) {
        dispatch( {type: ERROR, payload: err});
    }
};

export const deleteBounce = (bounceId, versionId) => async (dispatch, getState) => {
    const { currentBand } = getState().bands;
    try {
        const response = await greenhouse.post(
            '/bounces/delete',
            {
                bounceId,
                versionId,
                currentBand: currentBand.id
            }
        );
        dispatch({ type: DELETE_BOUNCE, payload: { bounce: response.data, version: versionId } });
    } catch (err) {
        dispatch( {type: ERROR, payload: err});
    }
};

export const deletePlaylist = playlistId => async (dispatch, getState) => {

    const { currentBand } = getState().bands;
    try {
        const response = await greenhouse.post(
            '/playlists/delete',
            {
                playlistId,
                currentBand: currentBand.id
            }
        );
        response.data.playlistsongs.forEach(playlistSongId => {
            dispatch(deletePlaylistSong(playlistSongId, response.data.id));
        });
        dispatch({ type: DELETE_PLAYLIST, payload: response.data });
    } catch (err) {
        dispatch( {type: ERROR, payload: err});
    }
};

export const deletePlaylistSong = (playlistSongId, playlistId) => async (dispatch, getState) => {
    const { currentBand } = getState().bands;
    try {
        const response = await greenhouse.post(
            '/playlistsongs/delete',
            {
                playlistSongId,
                playlistId,
                currentBand: currentBand.id
            }
        );
        dispatch({ type: DELETE_PLAYLISTSONG, payload: { playlistsong: response.data, playlist: playlistId } });
    } catch (err) {
        dispatch( {type: ERROR, payload: err});
    }
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

    const allSongs = song.playlist.songs.map(id => getState().playlistSongs[id]);
    const songList = allSongs.splice(allSongs.indexOf(song.self));
    const queue = songList.map(song => {
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