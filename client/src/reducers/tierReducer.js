import {
  FETCH_TIERS,
  CREATE_TIER,
  EDIT_TIER,
  DELETE_TIER,
  CREATE_TITLE,
  EDIT_TITLE,
  DELETE_TITLE,
  ORDER_TIER,
} from '../actions/types';
import _ from 'lodash';

const tiersReducer = (state = {}, action) => {
  switch (action.type) {
    case FETCH_TIERS:
      return { ...state, ..._.mapKeys(action.payload, 'id') };
    case CREATE_TIER:
      return { ...state, [action.payload.id]: action.payload };
    case EDIT_TIER:
      const oldTier = state[action.payload.id];
      if (oldTier.orderBy) {
        action.payload.orderBy = oldTier.orderBy;
      }
      const oldPosition = oldTier['position'];
      const newPosition = action.payload.position;
      let changedPositions = {};
      if (oldPosition > newPosition) {
        for (let item of Object.values(state)) {
          if (item.position >= newPosition && item.position < oldPosition) {
            const pos = item.position;
            changedPositions[item.id] = { ...item, position: pos + 1 };
          }
        }
      }
      if (oldPosition < newPosition) {
        for (let item of Object.values(state)) {
          if (item.position > oldPosition && item.position <= newPosition) {
            const pos = item.position;
            changedPositions[item.id] = { ...item, position: pos - 1 };
          }
        }
      }
      return {
        ...state,
        [action.payload.id]: action.payload,
        ...changedPositions,
      };
    case DELETE_TIER:
      const changePosition = Object.values(
        _.omit(state, state.currentBand)
      ).filter((t) => t.position > action.payload.position);
      changePosition.forEach((tier) => {
        tier.position = tier.position - 1;
      });
      delete state[action.payload.id];
      return { ...state, ..._.mapKeys(changePosition, 'id') };
    case ORDER_TIER:
      state[action.payload.tier].orderBy = action.payload.orderBy;
      return { ...state };
    case CREATE_TITLE:
      const addToTier = state[action.payload.tier];
      addToTier.trackList.push(action.payload.title.id);
      return { ...state, [addToTier.id]: addToTier };
    case EDIT_TITLE:
      if (action.payload.tier.new) {
        const newTier = state[action.payload.tier.new];
        newTier.trackList.push(action.payload.title.id);
        const oldTier = state[action.payload.tier.old];
        oldTier.trackList = oldTier.trackList.filter(
          (id) => id !== action.payload.title.id
        );
        return { ...state, [newTier.id]: newTier, [oldTier.id]: oldTier };
      } else {
        return state;
      }
    case DELETE_TITLE:
      const deleteFromTier = state[action.payload.tier];
      if (deleteFromTier) {
        const newTrackList = deleteFromTier.trackList.filter(
          (id) => id !== action.payload.title.id
        );
        deleteFromTier.trackList = newTrackList;
        return { ...state, [deleteFromTier.id]: deleteFromTier };
      }
      return state;
    default:
      return state;
  }
};

export default tiersReducer;
