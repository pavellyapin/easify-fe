/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { createReducer, on } from '@ngrx/store';
import * as UserActions from './user.action';
import UserState, { initializeState } from './user.state';

const initialState: UserState = initializeState();

export const userReducer = createReducer(
  initialState,

  // Trigger profile loading state
  on(UserActions.setProfileInfo, (state) => ({
    ...state,
    profileLoading: true,
  })),

  // Handle success: set profile data and finish loading
  on(UserActions.setProfileInfoSuccess, (state, { profile }) => ({
    ...state,
    displayName: profile.displayName,
    email: profile.email,
    avatarUrl: profile.avatarUrl,
    basicInfo: profile.basicInfo,
    dietNutrition: profile.dietNutrition,
    financialPlanning: profile.financialPlanning,
    lifestyleHealth: profile.lifestyleHealth,
    moreInfo: profile.moreInfo,
    resume: profile.resume,
    workSkills: profile.workSkills,
    profileLoading: false,
  })),
  on(UserActions.setBasicInfo, (state, { basicInfo }) => ({
    ...state,
    basicInfo,
  })),
  on(UserActions.setDietNutrition, (state, { dietNutrition }) => ({
    ...state,
    dietNutrition,
  })),
  on(UserActions.setFinancialPlanning, (state, { financialPlanning }) => ({
    ...state,
    financialPlanning,
  })),
  on(UserActions.setLifestyleHealth, (state, { lifestyleHealth }) => ({
    ...state,
    lifestyleHealth,
  })),
  on(UserActions.setMoreInfo, (state, { moreInfo }) => ({
    ...state,
    moreInfo,
  })),
  on(UserActions.setResume, (state, { resume }) => ({ ...state, resume })),
  on(UserActions.setWorkSkills, (state, { workSkills }) => ({
    ...state,
    workSkills,
  })),

  // Update Actions
  on(UserActions.updateBasicInfo, (state, { basicInfo }) => ({
    ...state,
    basicInfo,
  })),
  on(UserActions.updateDietNutrition, (state, { dietNutrition }) => ({
    ...state,
    dietNutrition,
  })),
  on(UserActions.updateFinancialPlanning, (state, { financialPlanning }) => ({
    ...state,
    financialPlanning,
  })),
  on(UserActions.updateLifestyleHealth, (state, { lifestyleHealth }) => ({
    ...state,
    lifestyleHealth,
  })),
  on(UserActions.updateMoreInfo, (state, { moreInfo }) => ({
    ...state,
    moreInfo,
  })),
  on(UserActions.updateResume, (state, { resume }) => ({ ...state, resume })),
  on(UserActions.updateWorkSkills, (state, { workSkills }) => ({
    ...state,
    workSkills,
  })),

  // Success Actions
  on(UserActions.setBasicInfoSuccess, (state, { basicInfo }) => ({
    ...state,
    basicInfo,
  })),
  on(UserActions.setDietNutritionSuccess, (state, { dietNutrition }) => ({
    ...state,
    dietNutrition,
  })),
  on(
    UserActions.setFinancialPlanningSuccess,
    (state, { financialPlanning }) => ({ ...state, financialPlanning }),
  ),
  on(UserActions.setLifestyleHealthSuccess, (state, { lifestyleHealth }) => ({
    ...state,
    lifestyleHealth,
  })),
  on(UserActions.setMoreInfoSuccess, (state, { moreInfo }) => ({
    ...state,
    moreInfo,
  })),
  on(UserActions.setResumeSuccess, (state, { resume }) => ({
    ...state,
    resume,
  })),
  on(UserActions.setWorkSkillsSuccess, (state, { workSkills }) => ({
    ...state,
    workSkills,
  })),
  on(UserActions.clearUser, () => initialState),

  // Error Handling
  on(UserActions.userError, (state, { error }) => ({
    ...state,
    UserError: error,
  })),
);
