import {
  FETCH_TIERS,
  CREATE_TIER,
  EDIT_TIER,
  DELETE_TIER,
  ORDER_TIER,
} from './types';
import { errorHandler } from './errors';
import greenhouse from '../apis/greenhouse';
import { deleteTitle } from '.';

export const fetchTiers = (bandId) => async (dispatch) => {
  try {
    const response = await greenhouse.get(`/tiers/${bandId}`);
    dispatch({ type: FETCH_TIERS, payload: response.data });
  } catch (err) {
    dispatch(errorHandler(err));
  }
};

export const createTier = (formValues) => async (dispatch, getState) => {
  try {
    const { currentBand } = getState().bands;
    const response = await greenhouse.post('/tiers', {
      ...formValues,
      currentBand: currentBand.id,
    });
    dispatch({ type: CREATE_TIER, payload: response.data });
  } catch (err) {
    dispatch(errorHandler(err));
  }
};

export const editTier = (formValues, tierId) => async (dispatch, getState) => {
  try {
    const tier = getState().tiers[tierId];
    const optimisticallyEditedTier = {
      ...tier,
      position: formValues.position,
    };
    dispatch({ type: EDIT_TIER, payload: optimisticallyEditedTier });
    const { currentBand } = getState().bands;
    const response = await greenhouse.patch(`/tiers/${tierId}`, {
      ...formValues,
      currentBand: currentBand.id,
    });
    dispatch({ type: EDIT_TIER, payload: response.data });
  } catch (err) {
    dispatch(errorHandler(err));
  }
};

export const deleteTier = (tierId) => async (dispatch, getState) => {
  const { currentBand } = getState().bands;
  try {
    const response = await greenhouse.post('/tiers/delete', {
      tierId,
      currentBand: currentBand.id,
    });
    response.data.trackList.forEach((titleId) => {
      dispatch(deleteTitle(titleId, response.data.id));
    });
    dispatch({ type: DELETE_TIER, payload: response.data });
  } catch (err) {
    dispatch(errorHandler(err));
  }
};

export const setOrder = (tier, orderBy) => {
  return { type: ORDER_TIER, payload: { tier, orderBy } };
};
