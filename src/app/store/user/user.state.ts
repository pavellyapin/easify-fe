import { UserAddressInfo, UserPerosnalInfo } from './user.model';

export default class UserState {
  uid?: string | undefined;
  personalInfo?: UserPerosnalInfo | undefined;
  addressInfo?: UserAddressInfo | undefined;
  UserError: Error | undefined;
}

export const initializeState = (): UserState => {
  return { uid: undefined, UserError: undefined };
};
