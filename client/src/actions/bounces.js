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

export const fetchBounces = (versionId) => async (dispatch) => {
  try {
    const response = await greenhouse.get(`/bounces/${versionId}`);
    dispatch({ type: FETCH_BOUNCES, payload: response.data });
  } catch (err) {
    dispatch(errorHandler(err));
  }
};

export const createBounce =
  (formValues, versionId) => async (dispatch, getState) => {
    dispatch({ type: UPLOAD_STARTED });
    try {
      const { currentBand } = getState().bands;
      const parentVersion = getState().versions[versionId];

      if (!parentVersion.bounces.length) {
        formValues.latest = true;
      }

      // if (formValues.file instanceof FileList) {
      //   formValues.file = formValues.file[0];
      // }

      formValues.file = formValues.file[0];

      // Create instance of FileReader
      const reader = new FileReader();

      // When the file has been succesfully read
      reader.onload = (event) => {
        // Create an instance of AudioContext
        const audioContext = new (window.AudioContext ||
          window.webkitAudioContext)();

        // Asynchronously decode audio file data contained in an ArrayBuffer.
        audioContext.decodeAudioData(event.target.result, async (buffer) => {
          // Obtain the duration in seconds of the audio file (with milliseconds as well, a float value)
          const duration = parseInt(buffer.duration);

          const formObject = {
            ...formValues,
            currentBand: currentBand.id,
            version: versionId,
            duration,
          };

          const formData = new FormData();

          for (let key in formObject) {
            formData.append(key, formObject[key]);
          }

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

          // dispatch({ type: SELECT_BOUNCE, payload: { titleId, bounce: response.data } });
          dispatch({
            type: CREATE_BOUNCE,
            payload: { bounce: response.data, version: versionId },
          });
        });
      };

      // In case the file couldn't be read
      reader.onerror = (event) => {
        console.error('An error ocurred reading the file: ', event);
      };

      // Read file as an ArrayBuffer, important !
      reader.readAsArrayBuffer(formValues.file);
    } catch (err) {
      dispatch({ type: UPLOAD_FAILURE });
      dispatch(errorHandler(err));
    }
  };

export const editBounce =
  (formValues, bounceId, versionId) => async (dispatch, getState) => {
    try {
      const { currentBand } = getState().bands;
      const thisBounce = getState().bounces[bounceId];
      if (thisBounce.latest) {
        formValues.latest = true;
      }
      if (formValues.file && formValues.file.length) {
        formValues.file = formValues.file[0];

        // Create instance of FileReader
        const reader = new FileReader();

        // When the file has been succesfully read
        reader.onload = (event) => {
          // Create an instance of AudioContext
          const audioContext = new (window.AudioContext ||
            window.webkitAudioContext)();

          // Asynchronously decode audio file data contained in an ArrayBuffer.
          audioContext.decodeAudioData(event.target.result, async (buffer) => {
            // Obtain the duration in seconds of the audio file (with milliseconds as well, a float value)
            const duration = parseInt(buffer.duration);

            const formObject = {
              ...formValues,
              currentBand: currentBand.id,
              duration,
            };

            const formData = new FormData();

            for (let key in formObject) {
              formData.append(key, formObject[key]);
            }

            const response = await greenhouse.patch(
              `/bounces/${bounceId}`,
              formData,
              {
                headers: { 'Content-Type': 'multipart/form-data' },
              }
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
          });
        };

        // In case the file couldn't be read
        reader.onerror = (event) => {
          console.error('An error ocurred reading the file: ', event);
        };

        // Read file as an ArrayBuffer, important !
        reader.readAsArrayBuffer(formValues.file);
      } else {
        const response = await greenhouse.patch(`/bounces/${bounceId}`, {
          ...formValues,
          currentBand: currentBand.id,
        });
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
      }
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
