/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
import { createReducer, on } from '@ngrx/store';
import {
  loadSchedule,
  loadScheduleFailure,
  loadScheduleSuccess,
} from './schedule.actions';

export interface ScheduleState {
  schedule: any | null; // Adjust the type according to your actual schedule structure
  error: any | null;
}

export const initialState: ScheduleState = {
  schedule: null,
  error: null,
};

export const scheduleReducer = createReducer(
  initialState,
  on(loadSchedule, (state) => ({ ...state, schedule: null, error: null })),
  on(loadScheduleSuccess, (state, { schedule }) => ({ ...state, schedule })),
  on(loadScheduleFailure, (state, { error }) => ({ ...state, error })),
);
