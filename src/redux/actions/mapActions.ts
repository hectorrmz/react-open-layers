import { actionTypes } from './ActionTypes';

export function saveMap(map: any) {
  return { type: actionTypes.SAVE_MAP, map };
}
