import { createAction } from '@ngrx/store';

export const setLoading = createAction(
  '[Loading] Set Loading',
  (isLoading: boolean) => ({ isLoading }),
);
