import _ from 'lodash';

import {
  FETCH_BOUNCES,
  CREATE_BOUNCE,
  EDIT_BOUNCE,
  DELETE_BOUNCE,
  UPLOAD_FAILURE,
  UPLOAD_STARTED,
} from './types';
import { errorHandler } from './errors';
import { selectBounce } from './titles';
import greenhouse from '../apis/greenhouse';

const processMp3 = (formValues) => {
  const file = formValues.file[0];
  const reader = new FileReader();

  if (process.env.NODE_ENV === 'test') {
    return Promise.resolve(formValues);
  }

  return new Promise((resolve, reject) => {
    reader.onload = (event) => {
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();

      audioContext.decodeAudioData(
        event.target.result,
        async (buffer) => {
          // Obtain the duration in seconds of the audio file
          const duration = parseInt(buffer.duration);
          const formObject = { ...formValues, duration, file };

          const formData = new FormData();
          for (let key in formObject) {
            formData.append(key, formObject[key]);
          }
          // continue dispatching the action
          resolve(formData);
        },
        (err) => {
          reject(err);
        }
      );
    };
    // In case the file couldn't be read
    reader.onerror = (event) => {
      reject(event);
    };

    reader.readAsArrayBuffer(file);
  });
};

export const fetchBounces = (versionId) => async (dispatch) => {
  try {
    const response = await greenhouse.get(`/bounces/${versionId}`);
    dispatch({ type: FETCH_BOUNCES, payload: response.data });
  } catch (err) {
    dispatch(errorHandler(err));
  }
};

export const createBounce =
  (formValues, versionId, titleId) => async (dispatch, getState) => {
    dispatch({ type: UPLOAD_STARTED });
    const { currentBand } = getState().bands;
    const parentVersion = getState().versions[versionId];

    if (!parentVersion.bounces.length) {
      formValues.latest = true;
    }
    formValues.currentBand = currentBand.id;
    formValues.version = versionId;

    try {
      const formData = await processMp3(formValues);

      const response = await greenhouse.post('/bounces', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.latest) {
        if (parentVersion.bounces.length) {
          const bounceList = parentVersion.bounces.map(
            (id) => getState().bounces[id]
          );
          const oldLatest = bounceList.find((b) => b.latest);
          oldLatest.latest = false;
          dispatch(
            editBounce(
              _.pick(oldLatest, 'date', 'comments', 'latest'),
              oldLatest.id,
              versionId
            )
          );
        }
      }
      dispatch({
        type: CREATE_BOUNCE,
        payload: { bounce: response.data, version: versionId },
      });
      dispatch(selectBounce(response.data, titleId));
    } catch (err) {
      // upload state not implemented
      dispatch({ type: UPLOAD_FAILURE });
      // if upload fails, make redux think it's a new bounce anyway
      const currentBounce = getState().titles[titleId].selectedBounce;
      dispatch(selectBounce({ ...currentBounce }, titleId));
      dispatch(errorHandler(err));
    }
  };

export const editBounce =
  (formValues, bounceId, versionId) => async (dispatch, getState) => {
    const { currentBand } = getState().bands;
    const thisBounce = getState().bounces[bounceId];

    if (thisBounce.latest) {
      formValues.latest = true;
    }
    formValues.currentBand = currentBand.id;

    let requestOptions = {};
    let formData = formValues;

    try {
      if (formValues.file?.length) {
        requestOptions.headers = { 'Content-Type': 'multipart/form-data' };
        formData = await processMp3(formValues);
      }

      const response = await greenhouse.patch(
        `/bounces/${bounceId}`,
        formData,
        requestOptions
      );

      if (response.data.latest && !thisBounce.latest) {
        const parentVersion = getState().versions[versionId];
        const bounceList = parentVersion.bounces.map(
          (id) => getState().bounces[id]
        );
        const oldLatest = bounceList.find((b) => b.latest);
        oldLatest.latest = false;
        dispatch(
          editBounce(
            _.pick(oldLatest, 'date', 'comments', 'latest'),
            oldLatest.id,
            versionId
          )
        );
      }

      dispatch({ type: EDIT_BOUNCE, payload: response.data });
    } catch (err) {
      dispatch(errorHandler(err));
    }
  };

export const deleteBounce =
  (bounceId, versionId, titleId) => async (dispatch, getState) => {
    const { currentBand } = getState().bands;
    try {
      const response = await greenhouse.post('/bounces/delete', {
        bounceId,
        versionId,
        currentBand: currentBand.id,
      });
      if (response.data.latest) {
        const parentVersion = getState().versions[versionId];
        if (parentVersion) {
          const remainingBounces = parentVersion.bounces.filter(
            (id) => id !== bounceId
          );
          if (remainingBounces.length) {
            const newLatest =
              getState().bounces[remainingBounces[remainingBounces.length - 1]];
            newLatest.latest = true;
            dispatch(selectBounce(newLatest, titleId));
            dispatch(
              editBounce(
                _.pick(newLatest, 'date', 'comments', 'latest'),
                newLatest.id,
                versionId
              )
            );
          } else {
            dispatch(selectBounce(null, titleId));
          }
        }
      }
      dispatch({
        type: DELETE_BOUNCE,
        payload: { bounce: response.data, version: versionId },
      });
    } catch (err) {
      dispatch(errorHandler(err));
    }
  };
