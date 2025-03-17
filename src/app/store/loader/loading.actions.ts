import { createAction, props } from '@ngrx/store';

export const setLoginLoading = createAction(
  '[Loading] Set Login Loading',
  props<{ isLoading: boolean; msg?: string }>(),
);

export const setDashboardLoading = createAction(
  '[Loading] Set Dashboard Loading',
  props<{ isLoading: boolean; msg?: string }>(),
);

export const setProfileLoading = createAction(
  '[Loading] Set Profile Loading',
  props<{ isLoading: boolean; msg?: string }>(),
);

export const setGlobalLoading = createAction(
  '[Loading] Set Global Loading',
  props<{ isLoading: boolean; msg?: string }>(),
);
