import { actionTypes } from '../actions/ActionTypes';

export default function mapReducer(state = {}, action: any) {
  switch (action.type) {
    case actionTypes.SAVE_MAP:
      return { ...state, ...action.map };

    default:
      return state;
  }
}
