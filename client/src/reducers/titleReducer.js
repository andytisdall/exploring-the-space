import {
  FETCH_TITLES,
  CREATE_TITLE,
  EDIT_TITLE,
  DELETE_TITLE,
  SELECT_VERSION,
  SELECT_BOUNCE,
  CREATE_VERSION,
  DELETE_VERSION,
} from '../actions/types';
import _ from 'lodash';

const titleReducer = (state = {}, action) => {
  switch (action.type) {
    case FETCH_TITLES:
      return { ...state, ..._.mapKeys(action.payload, 'id') };
    case CREATE_TITLE:
      return { ...state, [action.payload.title.id]: action.payload.title };
    case EDIT_TITLE:
      const oldTitle = state[action.payload.title.id];
      const newTitle = action.payload.title;
      newTitle.selectedVersion = oldTitle.selectedVersion;
      newTitle.selectedBounce = oldTitle.selectedBounce;
      return { ...state, [newTitle.id]: newTitle };
    case DELETE_TITLE:
      delete state[action.payload.title.id];
      return { ...state };
    case SELECT_VERSION:
      const versionTitle = state[action.payload.titleId];
      versionTitle.selectedVersion = action.payload.version;
      return { ...state, [versionTitle.id]: { ...versionTitle } };
    case SELECT_BOUNCE:
      const bounceTitle = state[action.payload.titleId];
      bounceTitle.selectedBounce = action.payload.bounce;
      return { ...state, [bounceTitle.id]: { ...bounceTitle } };
    case CREATE_VERSION:
      const addToTitle = state[action.payload.title];
      addToTitle.versions.push(action.payload.version.id);
      addToTitle.selectedVersion = action.payload.version;
      return { ...state, [addToTitle.id]: addToTitle };
    case DELETE_VERSION:
      const deleteFromTitle = state[action.payload.title];
      if (deleteFromTitle) {
        const newVersionList = deleteFromTitle.versions.filter(
          (id) => id !== action.payload.version.id
        );
        deleteFromTitle.versions = newVersionList;
        return { ...state, [deleteFromTitle.id]: deleteFromTitle };
      }
      return state;
    default:
      return state;
  }
};

export default titleReducer;
