import Redux from 'redux';

import types from './types';




export const signIn = userId => async (dispatch) => {
    const response = await greenhouse.post('/signin');
    dispatch(type: SIGN_IN, payload: response.data);
    history.push('/');
};

export const signOut = () => {
    return {
        type: SIGN_OUT
    };
};

export const createItem = formValues => async (dispatch, getState) => {
    const { userId } = getState().auth;
    const response = await greenhouse.post('/', { ...formValues, userId });
    
    dispatch({ type: CREATE_ITEM, payload: response.data });
    history.push('/');
};

export const fetchAll = (bandName) => async dispatch => {
    const response = await greenhouse.get(`/${bandName}`);
    dispatch({ type: types.FETCH_ALL, payload: response.data });
};


