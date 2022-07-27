import _ from 'lodash';

import {
  FETCH_VERSIONS,
  EDIT_VERSION,
  DELETE_VERSION,
  CREATE_VERSION,
} from './types';
import { errorHandler } from './errors';
import greenhouse from '../apis/greenhouse';
import { selectVersion, selectBounce } from './titles';
import { deleteBounce } from '.';

export const fetchVersions = (titleId) => async (dispatch) => {
  try {
    const response = await greenhouse.get(`/versions/${titleId}`);
    dispatch({ type: FETCH_VERSIONS, payload: response.data });
  } catch (err) {
    dispatch(errorHandler(err));
  }
};

export const createVersion =
  (formValues, titleId) => async (dispatch, getState) => {
    try {
      const { currentBand } = getState().bands;
      const parentTitle = getState().titles[titleId];

      if (!parentTitle.versions.length) {
        formValues.current = true;
      }

      const response = await greenhouse.post('/versions', {
        ...formValues,
        currentBand: currentBand.id,
        title: titleId,
      });

      if (response.data.current) {
        if (parentTitle.versions.length) {
          const versionList = parentTitle.versions.map(
            (id) => getState().versions[id]
          );
          const oldCurrent = versionList.find((v) => v.current);
          oldCurrent.current = false;
          dispatch(
            editVersion(
              _.pick(oldCurrent, 'name', 'notes', 'current'),
              oldCurrent.id,
              titleId
            )
          );
        }
        dispatch(selectVersion(response.data, titleId));
        dispatch(selectBounce(null, titleId));
      }

      // dispatch({ type: SELECT_VERSION, payload: { titleId, version: response.data } });
      dispatch({
        type: CREATE_VERSION,
        payload: { version: response.data, title: titleId },
      });
    } catch (err) {
      dispatch(errorHandler(err));
    }
  };

export const editVersion =
  (formValues, versionId, titleId) => async (dispatch, getState) => {
    try {
      const { currentBand } = getState().bands;
      const thisVersion = getState().versions[versionId];
      if (thisVersion.current) {
        formValues.current = true;
      }
      const response = await greenhouse.patch(`/versions/${versionId}`, {
        ...formValues,
        currentBand: currentBand.id,
        titleId,
      });
      if (response.data.current && !thisVersion.current) {
        const parentTitle = getState().titles[titleId];
        const versionList = parentTitle.versions.map(
          (id) => getState().versions[id]
        );
        const oldCurrent = versionList.find((v) => v.current);
        oldCurrent.current = false;
        dispatch(
          editVersion(
            _.pick(oldCurrent, 'name', 'notes', 'current'),
            oldCurrent.id,
            titleId
          )
        );
        dispatch(selectVersion(response.data, titleId));
        if (response.data.bounces.length) {
          const bounces = response.data.bounces.map(
            (id) => getState().bounces[id]
          );
          const bounce = bounces.find((b) => b.latest);
          dispatch(selectBounce(bounce, titleId));
        } else {
          dispatch(selectBounce(null, titleId));
        }
      }

      // dispatch({ type: SELECT_VERSION, payload: { titleId, version: response.data } });
      dispatch({
        type: EDIT_VERSION,
        payload: response.data,
      });
    } catch (err) {
      dispatch(errorHandler(err));
    }
  };

export const deleteVersion =
  (versionId, titleId) => async (dispatch, getState) => {
    const { currentBand } = getState().bands;
    try {
      const response = await greenhouse.post('/versions/delete', {
        versionId,
        titleId,
        currentBand: currentBand.id,
      });
      if (response.data.current) {
        const parentTitle = getState().titles[titleId];
        if (parentTitle) {
          const remainingVersions = parentTitle.versions.filter(
            (id) => id !== versionId
          );
          if (remainingVersions.length) {
            const newCurrent =
              getState().versions[
                remainingVersions[remainingVersions.length - 1]
              ];
            newCurrent.current = true;
            dispatch(selectVersion(newCurrent, titleId));
            dispatch(
              editVersion(
                _.pick(newCurrent, 'name', 'notes', 'current'),
                newCurrent.id,
                titleId
              )
            );
          } else {
            dispatch(selectVersion(null, titleId));
            dispatch(selectBounce(null, titleId));
          }
        }
      }
      response.data.bounces.forEach((bounceId) => {
        dispatch(deleteBounce(bounceId, response.data.id, titleId));
      });
      dispatch({
        type: DELETE_VERSION,
        payload: { version: response.data, title: titleId },
      });
    } catch (err) {
      dispatch(errorHandler(err));
    }
  };
