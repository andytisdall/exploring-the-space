import {
  PLAY_AUDIO,
  PAUSE_AUDIO,
  QUEUE_SONGS,
  NEXT_SONG,
  INITIALIZE_AUDIO,
  CHANGE_VOLUME,
} from './types';

export const playAudio = () => {
  return { type: PLAY_AUDIO };
};

export const pauseAudio = () => {
  return { type: PAUSE_AUDIO };
};

export const queueSongs = (song) => (dispatch) => {
  const songObject = {
    title: song.title,
    version: song.version.name,
    date: song.bounce.date,
    duration: song.bounce.duration,
    audio: song.bounce.id,
  };

  dispatch({
    type: QUEUE_SONGS,
    payload: { song: songObject, parent: song.tier },
  });
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
    position: song.position,
  };

  dispatch({
    type: QUEUE_SONGS,
    payload: { song: songObject, parent: song.playlist },
  });
};

export const nextSong = () => (dispatch, getState) => {
  const { parent, currentSong } = getState().audio;
  if (parent.trackList) {
    let allTitles;

    if (parent.orderBy === 'date' || !parent.orderyBy) {
      allTitles = parent.trackList
        .map((id) => getState().titles[id])
        .sort((a, b) => {
          if (a.selectedBounce && b.selectedBounce) {
            if (
              new Date(a.selectedBounce.date) > new Date(b.selectedBounce.date)
            ) {
              return -1;
            } else {
              return 1;
            }
          } else if (a.selectedBounce) {
            return -1;
          } else if (b.selectedBounce) {
            return 1;
          }
          return -1;
        });
    }

    if (parent.orderBy === 'name') {
      allTitles = parent.trackList
        .map((id) => getState().titles[id])
        .sort((a, b) => {
          return a.title < b.title ? -1 : 1;
        });
    }

    const currentIndex = allTitles.findIndex(
      (title) => title.id === currentSong.title.id
    );
    const song = allTitles[currentIndex + 1];

    if (song && song.selectedVersion && song.selectedBounce) {
      const version = getState().versions[song.selectedVersion.id];
      const bounce = getState().bounces[song.selectedBounce.id];

      const songObject = {
        title: song,
        version: version.name,
        date: bounce.date,
        duration: bounce.duration,
        audio: bounce.id,
      };

      dispatch({ type: NEXT_SONG, payload: songObject });
    } else {
      dispatch({ type: INITIALIZE_AUDIO });
    }
  }
  if (parent.songs) {
    const allSongs = parent.songs
      .map((id) => getState().playlistSongs[id])
      .sort((a, b) => (a.position < b.position ? -1 : 1));

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
      position: song.position,
    };
    dispatch({ type: NEXT_SONG, payload: songObject });
  }
};

export const prevSong = () => (dispatch, getState) => {
  const state = getState();
  const { parent, currentSong } = state.audio;
  if (parent.trackList) {
    let allTitles;
    if (parent.orderBy === 'date') {
      allTitles = parent.trackList
        .map((id) => state.titles[id])
        .sort((a, b) => {
          if (a.selectedBounce && b.selectedBounce) {
            if (
              new Date(a.selectedBounce.date) > new Date(b.selectedBounce.date)
            ) {
              return -1;
            } else {
              return 1;
            }
          } else if (a.selectedBounce) {
            return -1;
          } else if (b.selectedBounce) {
            return 1;
          }
          return -1;
        });
    }

    if (parent.orderBy === 'name') {
      allTitles = parent.trackList
        .map((id) => state.titles[id])
        .sort((a, b) => {
          return a.title < b.title ? -1 : 1;
        });
    }

    const song = allTitles[allTitles.indexOf(currentSong.title) - 1];

    if (song && song.selectedVersion && song.selectedBounce) {
      const version = state.versions[song.selectedVersion.id];
      const bounce = state.bounces[song.selectedBounce.id];

      const songObject = {
        title: song,
        version: version.name,
        date: bounce.date,
        duration: bounce.duration,
        audio: bounce.id,
      };

      dispatch({ type: NEXT_SONG, payload: songObject });
    }
  }

  if (parent.songs) {
    const allSongs = parent.songs
      .map((id) => state.playlistSongs[id])
      .sort((a, b) => (a.position < b.position ? -1 : 1));

    let song;
    let index = currentSong.position - 2;

    while (index < allSongs.length) {
      if (allSongs[index].bounce !== null) {
        song = allSongs[index];
        break;
      }
      index = index - 1;
    }

    if (!song) {
      return dispatch({ type: INITIALIZE_AUDIO });
    }

    const version = state.versions[song.version];
    const bounce = state.bounces[song.bounce];
    const title = state.titles[song.title];

    const songObject = {
      title: title,
      version: version.name,
      date: bounce.date,
      duration: bounce.duration,
      audio: bounce.id,
      position: song.position,
    };
    dispatch({ type: NEXT_SONG, payload: songObject });
  }
};

export const changeVolume = (value) => {
  return { type: CHANGE_VOLUME, payload: value };
};

export const initializeAudio = () => {
  return { type: INITIALIZE_AUDIO };
};
