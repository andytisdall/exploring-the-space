import { SIGN_IN, SIGN_OUT } from './types';
import { errorHandler } from './errors';
import greenhouse from '../apis/greenhouse';
import history from '../history';

export const signIn = (formValues) => async (dispatch) => {
  try {
    const response = await greenhouse.post('/signin', formValues);
    localStorage.setItem('token', response.data.token);
    dispatch({ type: SIGN_IN, payload: response.data.user });
    history.push('/user');
  } catch (err) {
    dispatch(errorHandler(err));
  }
};

export const signOut = () => {
  localStorage.removeItem('token');
  history.push('/');
  return { type: SIGN_OUT };
};

export const signUp = (formValues) => async (dispatch) => {
  try {
    const response = await greenhouse.post('/signup', formValues);
    localStorage.setItem('token', response.data.token);
    dispatch({ type: SIGN_IN, payload: response.data.user });
    history.push('/user');
  } catch (err) {
    dispatch(errorHandler(err));
  }
};
