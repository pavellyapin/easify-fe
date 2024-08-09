/**
 * User State models
 */

export default class User {
  uid?: string | undefined;
  personalInfo?: UserPerosnalInfo | undefined;
  addressInfo?: UserAddressInfo | undefined;
}

export class UserPerosnalInfo {
  firstName!: string;
  lastName!: string;
  phone!: string;
  email!: string;
}

export class UserAddressInfo {
  addressLine1!: string;
  addressLine2!: string;
  city!: string;
  province!: string;
  postal!: string;
}
