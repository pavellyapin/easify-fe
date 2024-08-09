import { createReducer, on } from '@ngrx/store';
import { addMessage, clearMessages, loadMessages } from './chat.actions';
import { ChatMessage } from './chat.model';

export interface ChatState {
  messages: ChatMessage[];
}

export const initialState: ChatState = {
  messages: [],
};

export const chatReducer = createReducer(
  initialState,
  on(addMessage, (state, { message }) => ({
    ...state,
    messages: [...state.messages, message],
  })),
  on(loadMessages, (state, { messages }) => ({
    ...state,
    messages: [...messages],
  })),
  on(clearMessages, (state) => ({
    ...state,
    messages: [],
  })),
);
