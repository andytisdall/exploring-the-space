import {
  FETCH_PLAYLISTSONGS,
  CREATE_PLAYLISTSONG,
  EDIT_PLAYLISTSONG,
  DELETE_PLAYLISTSONG,
  DELETE_VERSION,
  DELETE_BOUNCE,
} from '../actions/types';
import _ from 'lodash';

const playListSongReducer = (state = {}, action) => {
  switch (action.type) {
    case FETCH_PLAYLISTSONGS:
      return { ...state, ..._.mapKeys(action.payload, 'id') };
    case CREATE_PLAYLISTSONG:
      return {
        ...state,
        [action.payload.playlistsong.id]: action.payload.playlistsong,
      };
    case EDIT_PLAYLISTSONG:
      const oldPosition = state[action.payload.playlistsong.id]['position'];
      const newPosition = action.payload.playlistsong.position;
      let changedPositions = {};

      if (oldPosition > newPosition) {
        for (let item of Object.values(state)) {
          if (item.position >= newPosition && item.position < oldPosition) {
            const pos = item.position;
            changedPositions[item.id] = { ...item, position: pos + 1 };
          }
        }
      }
      if (oldPosition < newPosition) {
        for (let item of Object.values(state)) {
          if (item.position > oldPosition && item.position <= newPosition) {
            const pos = item.position;
            changedPositions[item.id] = { ...item, position: pos - 1 };
          }
        }
      }

      return {
        ...state,
        [action.payload.playlistsong.id]: action.payload.playlistsong,
        ...changedPositions,
      };
    case DELETE_PLAYLISTSONG:
      const changePosition = Object.values(state).filter(
        (p) => p.position > action.payload.playlistsong.position
      );
      changePosition.forEach((song) => {
        song.position = song.position - 1;
      });
      delete state[action.payload.playlistsong.id];
      return { ...state };
    case DELETE_VERSION:
      for (const id in state) {
        if (state[id].version === action.payload.version.id) {
          state[id].version = null;
          state[id].bounce = null;
        }
      }
      return { ...state };
    case DELETE_BOUNCE:
      for (const id in state) {
        if (state[id].bounce === action.payload.bounce.id) {
          state[id].bounce = null;
        }
      }
      return { ...state };
    default:
      return state;
  }
};

export default playListSongReducer;
