/* eslint-disable @typescript-eslint/no-unsafe-return */
import { createFeatureSelector, createSelector } from '@ngrx/store';
import UserState from './user.state';

export const selectUserState = createFeatureSelector<UserState>('user');
export const selectIsProfileLoading = createSelector(
  selectUserState,
  (state: UserState) => state.profileLoading, // Ensure this field exists in your state to track the profile loading status
);
// Selectors for each field
export const selectBasicInfo = createSelector(
  selectUserState,
  (state: UserState) => state.basicInfo,
);
export const selectDietNutrition = createSelector(
  selectUserState,
  (state: UserState) => state.dietNutrition,
);
export const selectFinancialPlanning = createSelector(
  selectUserState,
  (state: UserState) => state.financialPlanning,
);
export const selectLifestyleHealth = createSelector(
  selectUserState,
  (state: UserState) => state.lifestyleHealth,
);
export const selectMoreInfo = createSelector(
  selectUserState,
  (state: UserState) => state.moreInfo,
);
export const selectResume = createSelector(
  selectUserState,
  (state: UserState) => state.resume,
);
export const selectWorkSkills = createSelector(
  selectUserState,
  (state: UserState) => state.workSkills,
);
export const selectAvatarUrl = createSelector(
  selectUserState,
  (state: UserState) => state.avatarUrl,
);

// Error selector
export const selectUserError = createSelector(
  selectUserState,
  (state: UserState) => state.UserError,
);
