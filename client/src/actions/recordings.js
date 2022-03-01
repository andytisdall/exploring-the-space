import {
  CREATE_RECORDING,
  CLEAR_RECORDINGS,
  FETCH_RECORDING,
  DELETE_RECORDING,
  COMBINE_RECORDINGS,
} from './types';
import { errorHandler } from './errors';
import greenhouse from '../apis/greenhouse';

export const fetchRecording = (recordingId, index) => {
  return {
    type: FETCH_RECORDING,
    payload: { index, id: recordingId },
  };
};

export const combineRecordings = () => async (dispatch, getState) => {
  const { recordingList } = getState().recordings;

  const response = await greenhouse.post(
    `/recordings/combine`,
    { recordingList },
    { responseType: 'blob' }
  );

  dispatch({ type: COMBINE_RECORDINGS, payload: response.data });
};

export const createRecording = (blob) => async (dispatch, getState) => {
  try {
    const currentBand = getState().bands.currentBand;
    const formData = new FormData();
    formData.append('currentBand', currentBand);
    formData.append('file', blob);
    const response = await greenhouse.post('/recordings', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    // get the existing list of current recordings from local storage and add new stream id
    const recordingList =
      JSON.parse(localStorage.getItem('recording-list')) || [];
    localStorage.setItem(
      'recording-list',
      JSON.stringify([...recordingList, response.data])
    );

    dispatch({
      type: CREATE_RECORDING,
      payload: response.data,
    });
  } catch (err) {
    dispatch(errorHandler(err));
  }
};

export const clearRecordings = () => {
  const recordingList = JSON.parse(localStorage.getItem('recording-list'));
  if (recordingList) {
    recordingList.forEach((id) => {
      greenhouse.post('/recordings/delete', { id });
    });
    localStorage.removeItem('recording-list');
  }
  return { type: CLEAR_RECORDINGS };
};

export const deleteRecording = (id) => (dispatch) => {
  greenhouse.post('recordings/delete', { id });
  const recordingList = JSON.parse(localStorage.getItem('recording-list'));
  const editedList = recordingList.filter((recId) => recId !== id);
  localStorage.setItem('recording-list', JSON.stringify(editedList));
  dispatch({ type: DELETE_RECORDING, payload: id });
};
