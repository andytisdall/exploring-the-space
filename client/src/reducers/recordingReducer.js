import {
  FETCH_RECORDING,
  CREATE_RECORDING,
  CLEAR_RECORDINGS,
  DELETE_RECORDING,
} from '../actions/types';

export default (state = [], action) => {
  switch (action.type) {
    case FETCH_RECORDING:
      const thisState = [...state];
      const recording = { id: action.payload.id, audio: action.payload.blob };
      thisState[action.payload.index] = recording;
      return thisState;
    case CREATE_RECORDING:
      const newState = [...state];
      const newRecording = {
        id: action.payload.id,
        audio: action.payload.blob,
      };
      newState[action.payload.index] = newRecording;
      return newState;
    case CLEAR_RECORDINGS:
      return [];
    case DELETE_RECORDING:
      const editedState = state.filter((rec) => rec.id !== action.payload);
      return editedState;
    default:
      return state;
  }
};
