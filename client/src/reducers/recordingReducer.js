import { decode } from 'base64-arraybuffer';
import {
  FETCH_RECORDING,
  CREATE_RECORDING,
  CLEAR_RECORDINGS,
} from '../actions/types';

export default (state = [], action) => {
  switch (action.type) {
    case FETCH_RECORDING:
      const decoded = decode(action.payload.file);
      const arrayBuffer = new Uint8Array(decoded);
      const blob = new Blob([arrayBuffer], { type: 'audio/mpeg' });
      const thisState = [...state];
      thisState[action.payload.index] = blob;
      return thisState;
    case CREATE_RECORDING:
      const newState = [...state];
      newState[action.payload.index] = action.payload.file;
      return newState;
    case CLEAR_RECORDINGS:
      return [];
    default:
      return state;
  }
};
