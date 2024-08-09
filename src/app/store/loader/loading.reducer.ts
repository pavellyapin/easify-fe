/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { createReducer, on } from '@ngrx/store';
import { setLoading } from './loading.actions';

export interface LoaderState {
  loading: boolean;
}

export const initialState: LoaderState = {
  loading: false,
};

export const loadingReducer = createReducer(
  initialState,
  on(setLoading, (state, { isLoading }) => ({ ...state, loading: isLoading })),
);
