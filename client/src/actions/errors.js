import { ERROR } from './types';

export const errorHandler = (err) => (dispatch) => {
  let message;
  if (err.response) {
    message = err.response.data.error;
  } else {
    message = err.message;
  }
  console.log(err);
  setTimeout(() => {
    dispatch(throwError(null));
  }, 10000);
  dispatch({ type: ERROR, payload: message });
};

export const throwError = (message) => {
  return { type: ERROR, payload: message };
};
