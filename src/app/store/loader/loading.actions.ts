import { createAction } from '@ngrx/store';

export const setLoginLoading = createAction(
  '[Loading] Set login Loading',
  (isLoading: boolean) => ({ isLoading }),
);

export const setDashboardLoading = createAction(
  '[Loading] Set dashboard Loading',
  (isLoading: boolean) => ({ isLoading }),
);

export const setProfileLoading = createAction(
  '[Loading] Set profile Loading',
  (isLoading: boolean) => ({ isLoading }),
);

export const setGlobalLoading = createAction(
  '[Loading] Set global Loading',
  (isLoading: boolean) => ({ isLoading }),
);
