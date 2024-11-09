import { ChatState } from './chat/chat.reducer';
import { LoaderState } from './loader/loading.reducer';
import { RecipeState } from './recipe/recipe.reducer';
import { ScheduleState } from './schedule/schedule.reducer';
import { StartedCourseState } from './started-course/started-course.reducer';
import UserState from './user/user.state';

export interface AppState {
  chat: ChatState;
  dailyLook: ScheduleState;
  loader: LoaderState;
  recipe: RecipeState;
  user: UserState;
  startedCourse: StartedCourseState;
}
