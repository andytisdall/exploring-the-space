import {
  PLAY_AUDIO,
  PAUSE_AUDIO,
  QUEUE_SONGS,
  NEXT_SONG,
  DELETE_BOUNCE,
  CHANGE_VOLUME,
  INITIALIZE_AUDIO,
} from '../actions/types';

const initialState = {
  play: false,
  volume: 75,
  currentSong: null,
};

const audioReducer = (state = initialState, action) => {
  switch (action.type) {
    case PLAY_AUDIO:
      return { ...state, play: true, pause: false };
    case PAUSE_AUDIO:
      return { ...state, play: false, pause: true };
    case QUEUE_SONGS:
      const { song, parent } = action.payload;
      return { ...state, currentSong: song, play: true, parent };
    case NEXT_SONG:
      return { ...state, currentSong: action.payload };
    case DELETE_BOUNCE:
      if (
        state.currentSong &&
        action.payload.bounce.id === state.currentSong.audio
      ) {
        return { ...initialState };
      } else {
        return state;
      }
    case CHANGE_VOLUME:
      return { ...state, volume: action.payload };
    case INITIALIZE_AUDIO:
      return { ...initialState };
    default:
      return state;
  }
};

export default audioReducer;
