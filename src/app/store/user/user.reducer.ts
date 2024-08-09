/* eslint-disable no-empty-pattern */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Action, createReducer, on } from '@ngrx/store';
import * as UserActions from './user.action';
import UserState, { initializeState } from './user.state';

const initialState = initializeState();

const reducer = createReducer(
  initialState,

  on(UserActions.SuccessGetUserInfoAction, (state: UserState, { payload }) => {
    return {
      ...state,
      personalInfo: payload,
      UserError: undefined,
    };
  }),

  on(UserActions.SuccessSetCartUserAction, (state: UserState, { payload }) => {
    return {
      ...state,
      personalInfo: payload,
      UserError: undefined,
    };
  }),

  on(UserActions.BeginSetUserIDAction, (state: UserState, { payload }) => {
    return {
      ...state,
      uid: payload,
      UserError: undefined,
    };
  }),

  on(
    UserActions.SuccessGetUserAddressInfoAction,
    (state: UserState, { payload }) => {
      return {
        ...state,
        addressInfo: payload,
        UserError: undefined,
      };
    },
  ),

  on(UserActions.SuccessGetFavoritesAction, (state: UserState, { payload }) => {
    return {
      ...state,
      favorites: payload,
      UserError: undefined,
    };
  }),

  on(UserActions.SuccessGetOrdersAction, (state: UserState, { payload }) => {
    return {
      ...state,
      orders: payload,
      UserError: undefined,
    };
  }),
  on(UserActions.SuccessUserLogoutAction, (state: UserState, {}) => {
    return {
      ...state,
      uid: undefined,
      personalInfo: undefined,
      addressInfo: undefined,
      UserError: undefined,
    };
  }),

  on(UserActions.ErrorUserAction, (state: UserState, error: Error) => {
    return { ...state, UserError: error };
  }),
);

export function userReducer(
  state: UserState | undefined,
  action: Action,
): UserState {
  return reducer(state, action);
}
