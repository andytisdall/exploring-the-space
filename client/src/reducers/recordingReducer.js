import {
  FETCH_RECORDING,
  CREATE_RECORDING,
  CLEAR_RECORDINGS,
  DELETE_RECORDING,
  COMBINE_RECORDINGS,
} from '../actions/types';

const initialState = { recordingList: [] };

export default (state = initialState, action) => {
  switch (action.type) {
    case FETCH_RECORDING:
      const thisList = [...state.recordingList];
      thisList[action.payload.index] = action.payload.id;
      return { ...state, recordingList: thisList };
    case CREATE_RECORDING:
      const newList = [...state.recordingList, action.payload];
      return { ...state, recordingList: newList };
    case CLEAR_RECORDINGS:
      return { ...initialState };
    case DELETE_RECORDING:
      const editedList = state.recordingList.filter(
        (id) => id !== action.payload
      );
      return { ...state, recordingList: editedList };
    case COMBINE_RECORDINGS:
      return { ...state, combinedRecording: action.payload };
    default:
      return state;
  }
};
