import {
  FETCH_BAND,
  FETCH_BANDS,
  CREATE_BAND,
  EDIT_BAND,
  DELETE_BAND,
} from './types';
import { errorHandler } from './errors';
import greenhouse from '../apis/greenhouse';
import { deleteTier } from '.';

export const fetchBand = (bandName) => async (dispatch) => {
  try {
    const response = await greenhouse.get(`/bands/${bandName}`);
    dispatch({ type: FETCH_BAND, payload: response.data });
  } catch (err) {
    if (err.response && err.response.status === 404) {
      dispatch({ type: FETCH_BAND, payload: { id: 404 } });
    }
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

export const createBand = (formValues) => async (dispatch) => {
  try {
    const response = await greenhouse.post('/bands', formValues);
    dispatch({ type: CREATE_BAND, payload: response.data });
  } catch (err) {
    dispatch(errorHandler(err));
  }
};

export const editBand = (formValues, bandId) => async (dispatch) => {
  try {
    const response = await greenhouse.patch('/bands', {
      ...formValues,
      currentBand: bandId,
    });
    dispatch({ type: EDIT_BAND, payload: response.data });
  } catch (err) {
    dispatch(errorHandler(err));
  }
};

export const deleteBand = (bandId) => async (dispatch) => {
  try {
    const response = await greenhouse.post('/bands/delete', {
      currentBand: bandId,
    });
    response.data.tiers.forEach((tierId) => {
      dispatch(deleteTier(tierId, response.data.id));
    });
    dispatch({ type: DELETE_BAND, payload: response.data });
  } catch (err) {
    dispatch(errorHandler(err));
  }
};
