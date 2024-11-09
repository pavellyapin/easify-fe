/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { ActionReducer, INIT, UPDATE } from '@ngrx/store';
import { AppState } from '../app.state';

export const hydrationMetaReducer = (
  reducer: ActionReducer<AppState>,
): ActionReducer<AppState> => {
  return (state, action) => {
    if (action.type === INIT || action.type === UPDATE) {
      if (typeof window !== 'undefined' && window.localStorage) {
        const storageValue = localStorage.getItem('state');
        if (storageValue) {
          try {
            return JSON.parse(storageValue);
          } catch {
            localStorage.removeItem('state');
          }
        }
      }
    }

    const nextState = reducer(state, action);

    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('state', JSON.stringify(nextState));
    }

    return nextState;
  };
};
