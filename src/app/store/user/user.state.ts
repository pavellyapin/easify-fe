/* eslint-disable @typescript-eslint/no-explicit-any */
export default class UserState {
  uid?: string | undefined;
  displayName?: string | undefined;
  email?: string | undefined;
  avatarUrl?: string | undefined;
  basicInfo?: any;
  dietNutrition?: any;
  financialPlanning?: any;
  lifestyleHealth?: any;
  moreInfo?: any;
  resume?: any;
  workSkills?: any;
  profileLoading!: boolean;
  UserError: Error | undefined;
}

export const initializeState = (): UserState => {
  return { uid: undefined, profileLoading: false, UserError: undefined };
};
