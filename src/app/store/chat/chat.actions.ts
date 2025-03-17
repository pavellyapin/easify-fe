import { createAction, props } from '@ngrx/store';
import { ChatMessage } from './chat.model';

export const sendMessageToChat = createAction(
  '[Chat] Send Message to Chat',
  props<{ message: string }>(),
);

export const addMessage = createAction(
  '[Chat] Add Message',
  props<{ message: ChatMessage }>(),
);

export const loadMessages = createAction(
  '[Chat] Load Messages',
  props<{ messages: ChatMessage[] }>(),
);

export const clearMessages = createAction('[Chat] Clear Messages');
