import {
  FETCH_BAND,
  FETCH_BANDS,
  EDIT_BAND,
  DELETE_BAND,
  CREATE_BAND,
  CREATE_TIER,
  DELETE_TIER,
  CREATE_PLAYLIST,
  DELETE_PLAYLIST,
  SIGN_OUT,
  UPLOAD_STARTED,
  CREATE_BOUNCE,
  UPLOAD_FAILURE,
} from '../actions/types';
import _ from 'lodash';

export default (state = {}, action) => {
  switch (action.type) {
    case FETCH_BAND:
      return {
        ...state,
        [action.payload.id]: action.payload,
        currentBand: action.payload,
      };
    case FETCH_BANDS:
      return { ...state, ..._.mapKeys(action.payload, 'id') };
    case CREATE_BAND:
      return { ...state, [action.payload.id]: action.payload };
    case EDIT_BAND:
      return { ...state, [action.payload.id]: action.payload };
    case DELETE_BAND:
      delete state[action.payload.id];
      return { ...state };
    case CREATE_TIER:
      const { currentBand } = state;
      currentBand.tiers.push(action.payload.id);
      return { ...state, [currentBand.id]: currentBand, currentBand };
    case DELETE_TIER:
      const band = state.currentBand;
      const newTiers = band.tiers.filter((id) => id !== action.payload.id);
      band.tiers = newTiers;
      return { ...state, [band.id]: band, currentBand: band };
    case CREATE_PLAYLIST:
      const currentBandP = state.currentBand;
      currentBandP.playlists.push(action.payload.id);
      return {
        ...state,
        [currentBandP.id]: currentBandP,
        currentBand: currentBandP,
      };
    case DELETE_PLAYLIST:
      const bandP = state.currentBand;
      const newPlaylists = bandP.playlists.filter(
        (id) => id !== action.payload.id
      );
      bandP.playlists = newPlaylists;
      return { ...state, [bandP.id]: bandP, currentBand: bandP };
    case SIGN_OUT:
      return _.omit(state, state.currentBand);
    case UPLOAD_STARTED:
      return { ...state, uploadStarted: true };
    case UPLOAD_FAILURE:
      return { ...state, uploadStarted: false };
    case CREATE_BOUNCE:
      return { ...state, uploadStarted: false };
    default:
      return state;
  }
};
