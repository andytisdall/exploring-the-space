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

const processMp3 = (formValues, next, dispatch) => {
  const file = formValues.file[0];

  const reader = new FileReader();

  reader.onload = (event) => {
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();

    audioContext
      .decodeAudioData(event.target.result, async (buffer) => {
        // Obtain the duration in seconds of the audio file
        const duration = parseInt(buffer.duration);
        const formObject = { ...formValues, duration, file };

        const formData = new FormData();
        for (let key in formObject) {
          formData.append(key, formObject[key]);
        }
        // continue dispatching the action
        next(formData);
      })
      .catch((err) => {
        if (process.env.NODE_ENV === 'test') {
          next(formValues);
        } else {
          dispatch(errorHandler(err));
        }
      });
  };
  // In case the file couldn't be read
  reader.onerror = (event) => {
    console.log('An error ocurred reading the file: ', event);
  };

  reader.readAsArrayBuffer(file);
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
  (formValues, versionId, titleId) => (dispatch, getState) => {
    dispatch({ type: UPLOAD_STARTED });
    const { currentBand } = getState().bands;
    const parentVersion = getState().versions[versionId];

    if (!parentVersion.bounces.length) {
      formValues.latest = true;
    }
    formValues.currentBand = currentBand.id;
    formValues.version = versionId;

    processMp3(formValues, dispatchAction, dispatch);

    // call this to finish dispatching after the mp3 is processed
    async function dispatchAction(formData) {
      try {
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
        dispatch({ type: UPLOAD_FAILURE });
        dispatch(errorHandler(err));
      }
    }
  };

export const editBounce =
  (formValues, bounceId, versionId) => (dispatch, getState) => {
    const { currentBand } = getState().bands;
    const thisBounce = getState().bounces[bounceId];

    if (thisBounce.latest) {
      formValues.latest = true;
    }
    formValues.currentBand = currentBand.id;

    let requestOptions = {};
    if (formValues.file?.length) {
      requestOptions.headers = { 'Content-Type': 'multipart/form-data' };
      processMp3(formValues, dispatchAction);
    } else {
      dispatchAction(formValues);
    }

    async function dispatchAction(formData) {
      try {
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
            dispatch(selectBounce(newLatest.id, titleId));
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
