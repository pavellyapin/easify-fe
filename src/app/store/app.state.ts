import { ChatState } from './chat/chat.reducer';
import { CourseState } from './course/course.reducer';
import { FinanceState } from './finance/finance.reducer';
import { FitnessState } from './fitness/fitness.reducer';
import { GrowthState } from './growth/growth.reducer';
import { LoaderState } from './loader/loading.reducer';
import { RecipeState } from './recipe/recipe.reducer';
import { ScheduleState } from './schedule/schedule.reducer';
import { StartedCourseState } from './started-course/started-course.reducer';
import { StartedGrowthState } from './started-growth/started-growth.reducer';
import { StartedPortfolioState } from './started-portfolio/started-portfolio.reducer';
import { StartedRecipeState } from './started-recipe/started-recipe.reducer';
import { StartedWorkoutState } from './started-workout/started-workout.reducer';
import UserState from './user/user.state';

export interface AppState {
  chat: ChatState;
  dailyLook: ScheduleState;
  loader: LoaderState;
  recipe: RecipeState;
  course: CourseState;
  growth: GrowthState;
  fitness: FitnessState;
  finance: FinanceState;
  user: UserState;
  startedCourse: StartedCourseState;
  startedWorkout: StartedWorkoutState;
  startedRecipe: StartedRecipeState;
  startedGrowth: StartedGrowthState;
  startedPortfolio: StartedPortfolioState;
}
