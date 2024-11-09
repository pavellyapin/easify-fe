/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAction, props } from '@ngrx/store';

// Action to initiate profile loading, no input required
export const setProfileInfo = createAction('[User] Set Profile Info');

// Action to pass the profile data once successfully fetched
export const setProfileInfoSuccess = createAction(
  '[User] Set Profile Info Success',
  props<{ profile: any }>(),
);
// Set Actions
export const setBasicInfo = createAction(
  '[User] Set Basic Info',
  props<{ basicInfo: any }>(),
);
export const setDietNutrition = createAction(
  '[User] Set Diet Nutrition',
  props<{ dietNutrition: any }>(),
);
export const setFinancialPlanning = createAction(
  '[User] Set Financial Planning',
  props<{ financialPlanning: any }>(),
);
export const setLifestyleHealth = createAction(
  '[User] Set Lifestyle Health',
  props<{ lifestyleHealth: any }>(),
);
export const setMoreInfo = createAction(
  '[User] Set More Info',
  props<{ moreInfo: any }>(),
);
export const setResume = createAction(
  '[User] Set Resume',
  props<{ resume: any }>(),
);
export const setWorkSkills = createAction(
  '[User] Set Work Skills',
  props<{ workSkills: any }>(),
);

// Update Actions
export const updateBasicInfo = createAction(
  '[User] Update Basic Info',
  props<{ basicInfo: any }>(),
);
export const updateDietNutrition = createAction(
  '[User] Update Diet Nutrition',
  props<{ dietNutrition: any }>(),
);
export const updateFinancialPlanning = createAction(
  '[User] Update Financial Planning',
  props<{ financialPlanning: any }>(),
);
export const updateLifestyleHealth = createAction(
  '[User] Update Lifestyle Health',
  props<{ lifestyleHealth: any }>(),
);
export const updateMoreInfo = createAction(
  '[User] Update More Info',
  props<{ moreInfo: any }>(),
);
export const updateResume = createAction(
  '[User] Update Resume',
  props<{ resume: any }>(),
);
export const updateWorkSkills = createAction(
  '[User] Update Work Skills',
  props<{ workSkills: any }>(),
);

// Set Success Actions
export const setBasicInfoSuccess = createAction(
  '[User] Set Basic Info Success',
  props<{ basicInfo: any }>(),
);
export const setDietNutritionSuccess = createAction(
  '[User] Set Diet Nutrition Success',
  props<{ dietNutrition: any }>(),
);
export const setFinancialPlanningSuccess = createAction(
  '[User] Set Financial Planning Success',
  props<{ financialPlanning: any }>(),
);
export const setLifestyleHealthSuccess = createAction(
  '[User] Set Lifestyle Health Success',
  props<{ lifestyleHealth: any }>(),
);
export const setMoreInfoSuccess = createAction(
  '[User] Set More Info Success',
  props<{ moreInfo: any }>(),
);
export const setResumeSuccess = createAction(
  '[User] Set Resume Success',
  props<{ resume: any }>(),
);
export const setWorkSkillsSuccess = createAction(
  '[User] Set Work Skills Success',
  props<{ workSkills: any }>(),
);

// Update Success Actions
export const updateBasicInfoSuccess = createAction(
  '[User] Update Basic Info Success',
  props<{ basicInfo: any }>(),
);
export const updateDietNutritionSuccess = createAction(
  '[User] Update Diet Nutrition Success',
  props<{ dietNutrition: any }>(),
);
export const updateFinancialPlanningSuccess = createAction(
  '[User] Update Financial Planning Success',
  props<{ financialPlanning: any }>(),
);
export const updateLifestyleHealthSuccess = createAction(
  '[User] Update Lifestyle Health Success',
  props<{ lifestyleHealth: any }>(),
);
export const updateMoreInfoSuccess = createAction(
  '[User] Update More Info Success',
  props<{ moreInfo: any }>(),
);
export const updateResumeSuccess = createAction(
  '[User] Update Resume Success',
  props<{ resume: any }>(),
);
export const updateWorkSkillsSuccess = createAction(
  '[User] Update Work Skills Success',
  props<{ workSkills: any }>(),
);
export const clearUser = createAction('[User] Clear user');

// Error handling actions
export const userError = createAction('[User] Error', props<{ error: any }>());
