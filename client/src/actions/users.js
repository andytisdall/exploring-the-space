import greenhouse from '../apis/greenhouse';
import { SIGN_IN } from './types';
import { errorHandler } from './errors';
import { signOut } from '.';

export const fetchUser = () => async (dispatch) => {
  try {
    const response = await greenhouse.get('/user');
    if (response.data) {
      dispatch({ type: SIGN_IN, payload: response.data });
    } else {
      dispatch(signOut());
    }
  } catch (err) {
    dispatch(errorHandler(err));
  }
};
