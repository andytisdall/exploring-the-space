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

const orderTitles = (tier, state) => {
  const titleList = tier.trackList
    .map((id) => state.titles[id])
    .filter((title) => title && title.selectedBounce);

  if (tier.orderBy === 'date' || !tier.orderyBy) {
    return titleList.sort((a, b) => {
      if (new Date(a.selectedBounce.date) > new Date(b.selectedBounce.date)) {
        return -1;
      } else {
        return 1;
      }
    });
  }

  if (tier.orderBy === 'name') {
    return titleList.sort((a, b) => {
      return a.title < b.title ? -1 : 1;
    });
  }
};

const updateQueue = (action, state, currentSong = null) => {
  let increment;

  if (action === 'next') {
    increment = 1;
  } else if (action === 'prev') {
    increment = -1;
  } else {
    increment = 0;
  }

  if (!currentSong) {
    currentSong = state.audio.currentSong;
  }
  const { parent } = currentSong;

  // parent is tier
  if (parent.trackList) {
    const updatedParent = state.tiers[parent.id];
    const allTitles = orderTitles(updatedParent, state);
    const currentIndex = allTitles.findIndex(
      (title) =>
        title.title === currentSong.title || title.id === currentSong.id
    );

    const song = allTitles[currentIndex + increment];
    if (!song) {
      return null;
    }
    const version = song.selectedVersion;
    const bounce = song.selectedBounce;

    return {
      title: song.title,
      version: version.name,
      date: bounce.date,
      duration: bounce.duration,
      audio: bounce.id,
      parent: updatedParent,
    };
  }

  // parent is playlist
  if (parent.songs) {
    const updatedParent = state.playlists[parent.id];
    const allSongs = updatedParent.songs
      .map((id) => state.playlistSongs[id])
      .filter((song) => song.bounce)
      .sort((a, b) => (a.position < b.position ? -1 : 1));

    const song = allSongs[currentSong.position + (increment - 1)];
    if (!song) {
      return null;
    }

    const version = state.versions[song.version];
    const bounce = state.bounces[song.bounce];
    const title = state.titles[song.title];

    return {
      title: title.title,
      version: version.name,
      date: bounce.date,
      duration: bounce.duration,
      audio: bounce.id,
      position: song.position,
      parent: updatedParent,
    };
  }
};

export const queueSongs = (song) => (dispatch) => {
  const songObject = {
    title: song.title.title,
    version: song.version.name,
    date: song.bounce.date,
    duration: song.bounce.duration,
    audio: song.bounce.id,
    parent: song.parent,
    position: song.position,
  };

  dispatch({
    type: QUEUE_SONGS,
    payload: songObject,
  });
};

export const nextSong = () => (dispatch, getState) => {
  const state = getState();
  const songObject = updateQueue('next', state);
  if (!songObject) {
    dispatch(initializeAudio());
  }

  dispatch({ type: NEXT_SONG, payload: songObject });
};

export const prevSong = () => (dispatch, getState) => {
  const state = getState();
  const songObject = updateQueue('prev', state);
  if (!songObject) {
    dispatch(initializeAudio());
  }

  dispatch({ type: NEXT_SONG, payload: songObject });
};

export const changeVolume = (value) => {
  return { type: CHANGE_VOLUME, payload: value };
};

export const initializeAudio = () => {
  return { type: INITIALIZE_AUDIO };
};
