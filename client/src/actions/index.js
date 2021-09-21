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
    CHANGE_VOLUME,
    INITIALIZE_AUDIO,
    SELECT_VERSION,
    SELECT_BOUNCE,
} from './types';
import history from '../history';
import _ from 'lodash';

const errorHandler = err => {
    let message;
    if (err.response) {
        message = err.response.data.error
    } else {
        message = err.message;
    }
    return { type: ERROR, payload: message };
};


export const signIn = formValues => async (dispatch) => {
    try {
        const response = await greenhouse.post('/signin', formValues);
        localStorage.setItem('token', response.data.token );
        dispatch({ type: SIGN_IN, payload: response.data.user });
        history.push('/user');
    } catch (err) {
        dispatch(errorHandler(err));
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
        dispatch(errorHandler(err));
    }
};

export const throwError = message => {
    return { type: ERROR, payload: message };
};

export const fetchUser = () => async dispatch => {
    try {
        const response = await greenhouse.get('/user');
        if (response.data) {
            dispatch({ type: SIGN_IN, payload: response.data });
        } else {
            dispatch(signOut());
        }
    } catch (err) {
        dispatch(errorHandler(err));
    }
};

export const fetchBand = bandName => async (dispatch) => {
    try {
        const response = await greenhouse.get(`/bands/${bandName}`);    
        dispatch({ type: FETCH_BAND, payload: response.data });
    } catch (err) {
        dispatch(errorHandler(err));
    }
};

export const fetchBands = () => async (dispatch) => {
    try {
        const response = await greenhouse.get(`/bands`);
        dispatch({ type: FETCH_BANDS, payload: response.data });
    } catch (err) {
        dispatch(errorHandler(err));
    }
};

export const fetchTiers = bandId => async (dispatch) => {
    try {
        const response = await greenhouse.get(`/tiers/${bandId}`);
        dispatch({ type: FETCH_TIERS, payload: response.data });
    } catch (err) {
        dispatch(errorHandler(err));
    }
};

export const fetchTitles = tierId => async (dispatch) => {
    try {
        const response = await greenhouse.get(`/titles/${tierId}`);
        dispatch({ type: FETCH_TITLES, payload: response.data });
    } catch (err) {
        dispatch(errorHandler(err));
    }
};

export const fetchVersions = titleId => async (dispatch) => {
    try {
        const response = await greenhouse.get(`/versions/${titleId}`);
        dispatch({ type: FETCH_VERSIONS, payload: response.data });
    } catch (err) {
        dispatch(errorHandler(err));
    }
};

export const fetchBounces = versionId => async (dispatch) => {
    try {
        const response = await greenhouse.get(`/bounces/${versionId}`);
        dispatch({ type: FETCH_BOUNCES, payload: response.data });
    } catch (err) {
        dispatch(errorHandler(err));
    }
};

export const fetchPlaylists = bandId => async (dispatch) => {
    try {
        const response = await greenhouse.get(`/playlists/${bandId}`);
        dispatch({ type: FETCH_PLAYLISTS, payload: response.data });
    } catch (err) {
        dispatch(errorHandler(err));
    }
};

export const fetchPlaylistSongs = playlistId => async (dispatch) => {
    try {
        const response = await greenhouse.get(`/playlistsongs/${playlistId}`);
        dispatch({ type: FETCH_PLAYLISTSONGS, payload: response.data });
    } catch (err) {
        dispatch(errorHandler(err));
    }
};



export const createBand = formValues => async (dispatch) => {
    try {
        const response = await greenhouse.post('/bands', formValues);
        dispatch({ type: CREATE_BAND, payload: response.data });
    } catch (err) {
        dispatch(errorHandler(err));
    }
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
        dispatch(errorHandler(err));
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
        dispatch(errorHandler(err));
    }
};

export const createVersion = (formValues, titleId) => async (dispatch, getState) => {
    try {

        const { currentBand } = getState().bands;
        const parentTitle = getState().titles[titleId];

        if (!parentTitle.versions.length) {
            formValues.current = true;
        }
        
        const response = await greenhouse.post(
            '/versions',
            { ...formValues, currentBand: currentBand.id, title: titleId }
        );    

        if (response.data.current) {
            if (parentTitle.versions.length) {
                const versionList = parentTitle.versions.map(id => getState().versions[id]);
                const oldCurrent = versionList.find(v => v.current);
                oldCurrent.current = false;
                dispatch(editVersion(
                    _.pick(oldCurrent, 'name', 'notes', 'current'), oldCurrent.id, titleId
                ));
            }
            dispatch({ type: SELECT_VERSION, payload: { titleId, version: response.data } });
        }

        dispatch({ type: CREATE_VERSION, payload: { version: response.data, title: titleId } });
    } catch (err) {
        dispatch(errorHandler(err));
    }
};

export const createBounce = (formValues, versionId, titleId) => async (dispatch, getState) => {

    try {
        const { currentBand } = getState().bands;
        const parentVersion = getState().versions[versionId];

        if (!parentVersion.bounces.length) {
            formValues.latest = true;
        }

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

                if (response.data.latest) {
                    
                    if (parentVersion.bounces.length) {
                        const bounceList = parentVersion.bounces.map(id => getState().bounces[id]);
                        const oldLatest = bounceList.find(b => b.latest);
                        oldLatest.latest = false;
                        dispatch(editBounce(
                            _.pick(oldLatest, 'date', 'comments', 'latest'), oldLatest.id, versionId
                        ));
                    }
                    dispatch({ type: SELECT_BOUNCE, payload: { titleId, bounce: response.data } });
                }

                dispatch({ type: CREATE_BOUNCE, payload: { bounce: response.data, version: versionId } });
            });
        };

        // In case the file couldn't be read
        reader.onerror =  event => {
            console.error("An error ocurred reading the file: ", event);
        };

        // Read file as an ArrayBuffer, important !
        reader.readAsArrayBuffer(formValues.file);

    } catch (err) {
        dispatch(errorHandler(err));
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
        dispatch(errorHandler(err));
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
        dispatch(errorHandler(err));
    }
};

export const editBand = (formValues, bandId) => async dispatch => {
    try {
        const response = await greenhouse.patch('/bands', { ...formValues, currentBand: bandId});
        dispatch({ type: EDIT_BAND, payload: response.data });
    } catch (err) {
        dispatch(errorHandler(err));
    }
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
        dispatch(errorHandler(err));
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
        dispatch(errorHandler(err));
    }
};

export const editVersion = (formValues, versionId, titleId) => async (dispatch, getState) => {
    try {
        const { currentBand } = getState().bands;
        const thisVersion = getState().versions[versionId];
        if (thisVersion.current) {
            formValues.current = true;
        }
        const response = await greenhouse.patch(
            `/versions/${versionId}`,
            { ...formValues, currentBand: currentBand.id }
        );
        if (response.data.current && !thisVersion.current) {
            const parentTitle = getState().titles[titleId];
            const versionList = parentTitle.versions.map(id => getState().versions[id]);
            const oldCurrent = versionList.find(v => v.current);
            oldCurrent.current = false;
            dispatch(editVersion(
                _.pick(oldCurrent, 'name', 'notes', 'current'), oldCurrent.id, titleId
            ));   
        }
        dispatch({ type: EDIT_VERSION, payload: response.data });
    } catch (err) {
        dispatch(errorHandler(err));
    }
};

export const editBounce = (formValues, bounceId, versionId) => async (dispatch, getState) => {
    try {
        const { currentBand } = getState().bands;
        const thisBounce = getState().bounces[bounceId];
        if (thisBounce.latest) {
            formValues.latest = true;
        }
        if (formValues.file && formValues.file.length) {
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
    
                    const response = await greenhouse.patch(
                        `/bounces/${bounceId}`, 
                        formData,
                        {
                            headers: { 'Content-Type': 'multipart/form-data'}
                        }
                    );

                    if (response.data.latest && !thisBounce.latest) {
                        const parentVersion = getState().versions[versionId];
                        const bounceList = parentVersion.bounces.map(id => getState().bounces[id]);
                        const oldLatest = bounceList.find(b => b.latest);
                        oldLatest.latest = false;
                        dispatch(editBounce(
                            _.pick(oldLatest, 'date', 'comments', 'latest'), oldLatest.id, versionId
                        ));
                    }
    
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
        dispatch(errorHandler(err));
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
        dispatch(errorHandler(err));
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
        dispatch(errorHandler(err));
    }
};





export const deleteBand = bandId => async dispatch => {
    try {
        const response = await greenhouse.post(
            '/bands/delete',
            { currentBand: bandId }
        );
        response.data.tiers.forEach(tierId => {
            dispatch(deleteTier(tierId, response.data.id));
        });
        dispatch({ type: DELETE_BAND, payload: response.data });
    } catch (err) {
        dispatch(errorHandler(err));
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
        dispatch(errorHandler(err));
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
        const playlists = Object.values(getState().playlists);
        const playlistSongs = Object.values(getState().playlistSongs).filter(pls => pls.title === titleId);
        playlistSongs.forEach(pls => {
            const playlist = playlists.find(pl => pl.songs.includes(pls.id));
            dispatch(deletePlaylistSong(pls.id, playlist.id));
        });
        dispatch({ type: DELETE_TITLE, payload: { title: response.data, tier: tierId } });
    } catch (err) {
        dispatch(errorHandler(err));
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
                const remainingVersions = parentTitle.versions.filter(id => id !== versionId);
                if (remainingVersions.length) {
                    const newCurrent = getState().versions[remainingVersions[remainingVersions.length-1]];
                    newCurrent.current = true;
                    dispatch(selectVersion(newCurrent.id, titleId));
                    dispatch(editVersion(
                        _.pick(newCurrent, 'name', 'notes', 'current'), newCurrent.id, titleId
                    ));
                } else {
                    dispatch(selectVersion(null, titleId));     
                }   
            }
        }
        response.data.bounces.forEach(bounceId => {
            dispatch(deleteBounce(bounceId, response.data.id, titleId));
        });
        dispatch({ type: DELETE_VERSION, payload: { version: response.data, title: titleId } });
    } catch (err) {
        dispatch(errorHandler(err));
    }
};

export const deleteBounce = (bounceId, versionId, titleId) => async (dispatch, getState) => {
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
        if (response.data.latest) {
            const parentVersion = getState().versions[versionId];
            if (parentVersion) {
                const remainingBounces = parentVersion.bounces.filter(id => id !== bounceId);
                if (remainingBounces.length) {
                    const newLatest = getState().bounces[remainingBounces[remainingBounces.length -1]];
                    newLatest.latest = true;
                    dispatch(selectBounce(newLatest.id, titleId));
                    dispatch(editBounce(
                        _.pick(newLatest, 'date', 'comments', 'latest'), newLatest.id, versionId
                    ));
                } else {
                    dispatch(selectBounce(null, titleId));
                }  
            }
        }
        dispatch({ type: DELETE_BOUNCE, payload: { bounce: response.data, version: versionId } });
    } catch (err) {
        dispatch(errorHandler(err));
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
        response.data.songs.forEach(playlistSongId => {
            dispatch(deletePlaylistSong(playlistSongId, response.data.id));
        });
        dispatch({ type: DELETE_PLAYLIST, payload: response.data });
    } catch (err) {
        dispatch(errorHandler(err));
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
        dispatch(errorHandler(err));
    }
};

export const playAudio = () => {
    return { type: PLAY_AUDIO };
};

export const pauseAudio = () => {
    return { type: PAUSE_AUDIO };
};

export const queueSongs = (song) => (dispatch, getState) => {
  

    const songObject = {
        title: song.title,
        version: song.version.name,
        date: song.bounce.date,
        duration: song.bounce.duration,
        audio: song.bounce.id
    };

    dispatch({ type: QUEUE_SONGS, payload: { song: songObject, parent: song.tier } });
    

};

export const queuePlaylistSongs = (song) => (dispatch, getState) => {

    // const version = getState().versions[song.version];
    // const bounce = getState().bounces[song.bounce];
    // const title = getState().titles[song.title];

    const songObject = {
        title: song.title,
        version: song.version.name,
        date: song.bounce.date,
        duration: song.bounce.duration,
        audio: song.bounce.id,
        position: song.position
    };

    dispatch({ type: QUEUE_SONGS, payload: { song: songObject, parent: song.playlist } });
};


export const nextSong = () => (dispatch, getState) => {
    const { parent, currentSong } = getState().audio;
    if (parent.trackList) {
        const allTitles = parent.trackList
            .map(id => getState().titles[id])
            .sort((a, b) => {
                if (a.selectedBounce && b.selectedBounce) {
                    if (new Date(a.selectedBounce.date) > new Date(b.selectedBounce.date)) {
                        return -1;
                    } else {
                        return 1;
                    }
                } else if (a.selectedBounce) {
                    return -1
                } else if (b.selectedBounce) {
                    return 1;
                }
            });

        const song = allTitles[allTitles.indexOf(currentSong.title) + 1];

        if (song && song.selectedVersion && song.selectedBounce) {
            const version = getState().versions[song.selectedVersion.id];
            const bounce = getState().bounces[song.selectedBounce.id];

            const songObject = {
                title: song,
                version: version.name,
                date: bounce.date,
                duration: bounce.duration,
                audio: bounce.id
            };

            dispatch({ type: NEXT_SONG, payload: songObject });
        } else {
            dispatch({ type: INITIALIZE_AUDIO });
        }
    }
    if (parent.songs) {
        const allSongs = parent.songs.map(id => getState().playlistSongs[id])
            .sort((a,b) => a.position < b.position  ? -1 : 1);

        let song;
        let index = currentSong.position;

        while (index < allSongs.length) {
            if (allSongs[index].bounce !== null) {
                song = allSongs[index];
                break;
            }
            index++;
        }

        if (!song) {
            return dispatch({ type: INITIALIZE_AUDIO });
        }

        const version = getState().versions[song.version];
        const bounce = getState().bounces[song.bounce];
        const title = getState().titles[song.title];

        const songObject = {
            title: title,
            version: version.name,
            date: bounce.date,
            duration: bounce.duration,
            audio: bounce.id,
            position: song.position
        };
        dispatch({ type: NEXT_SONG, payload: songObject });
    }
    
}

export const changeVolume = value => {
    return { type: CHANGE_VOLUME, payload: value };
}

export const initializeAudio = () => {
    return { type: INITIALIZE_AUDIO };
}


export const selectVersion = (version, titleId) => {
    return { type: SELECT_VERSION, payload: { version, titleId } };
}

export const selectBounce = (bounce, titleId) => {
    return { type: SELECT_BOUNCE, payload: { bounce, titleId } };
}