import { CREATE_TITLE, EDIT_TITLE, DELETE_TITLE } from '../actions/types';
import _ from 'lodash';

export default (state = {}, action) => {

    switch (action.type) {

        case CREATE_TITLE:
            return { ...state, [action.payload.position]: action.payload };
        case EDIT_TITLE:
            return { ...state, [action.payload.position]: action.payload };
        case DELETE_TITLE:
            return _.omit(state, action.payload);
        default:
            return state;

    }

};