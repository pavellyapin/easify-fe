import { ChatState } from './chat/chat.reducer';
import { LoaderState } from './loader/loading.reducer';
import { RecipeState } from './recipe/recipe.reducer';
import { ScheduleState } from './schedule/schedule.reducer';

export interface AppState {
  chat: ChatState;
  dailyLook: ScheduleState;
  loader: LoaderState;
  recipe: RecipeState;
}
