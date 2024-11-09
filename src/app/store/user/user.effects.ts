import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { RegisterService } from '@services/register.service';
import { UserService } from '@services/user.service';
import { of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import * as UserActions from './user.action';
@Injectable()
export class UserEffects {
  constructor(
    private actions$: Actions,
    private userService: UserService,
    private registerService: RegisterService,
  ) {}

  // Effect for setting full profile information
  setProfileInfo$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.setProfileInfo), // Trigger on setProfileInfo action
      mergeMap(() =>
        this.userService.getFullProfile().pipe(
          map(
            (profile) => UserActions.setProfileInfoSuccess({ profile }), // Dispatch success action with profile data
          ),
          catchError((error) => of(UserActions.userError({ error }))), // Handle errors
        ),
      ),
    ),
  );

  // Effect for setting Basic Info
  setBasicInfo$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.setBasicInfo),
      mergeMap((action) =>
        this.registerService.setBasicInfo(action.basicInfo).pipe(
          map((response) =>
            UserActions.setBasicInfoSuccess({ basicInfo: response }),
          ),
          catchError((error) => of(UserActions.userError({ error }))),
        ),
      ),
    ),
  );

  // Effect for updating Basic Info
  updateBasicInfo$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.updateBasicInfo),
      mergeMap((action) =>
        this.registerService.updateBasicInfo(action.basicInfo).pipe(
          map((response) =>
            UserActions.updateBasicInfoSuccess({ basicInfo: response }),
          ),
          catchError((error) => of(UserActions.userError({ error }))),
        ),
      ),
    ),
  );

  // Effect for setting Diet Nutrition
  setDietNutrition$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.setDietNutrition),
      mergeMap((action) =>
        this.registerService.setDietNutrition(action.dietNutrition).pipe(
          map((response) =>
            UserActions.setDietNutritionSuccess({ dietNutrition: response }),
          ),
          catchError((error) => of(UserActions.userError({ error }))),
        ),
      ),
    ),
  );

  // Effect for updating Diet Nutrition
  updateDietNutrition$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.updateDietNutrition),
      mergeMap((action) =>
        this.registerService.updateDietNutrition(action.dietNutrition).pipe(
          map((response) =>
            UserActions.updateDietNutritionSuccess({ dietNutrition: response }),
          ),
          catchError((error) => of(UserActions.userError({ error }))),
        ),
      ),
    ),
  );

  // Effect for setting Financial Planning
  setFinancialPlanning$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.setFinancialPlanning),
      mergeMap((action) =>
        this.registerService
          .setFinancialPlanning(action.financialPlanning)
          .pipe(
            map((response) =>
              UserActions.setFinancialPlanningSuccess({
                financialPlanning: response,
              }),
            ),
            catchError((error) => of(UserActions.userError({ error }))),
          ),
      ),
    ),
  );

  // Effect for updating Financial Planning
  updateFinancialPlanning$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.updateFinancialPlanning),
      mergeMap((action) =>
        this.registerService
          .updateFinancialPlanning(action.financialPlanning)
          .pipe(
            map((response) =>
              UserActions.updateFinancialPlanningSuccess({
                financialPlanning: response,
              }),
            ),
            catchError((error) => of(UserActions.userError({ error }))),
          ),
      ),
    ),
  );

  // Effect for setting Lifestyle Health
  setLifestyleHealth$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.setLifestyleHealth),
      mergeMap((action) =>
        this.registerService.setLifestyleHealth(action.lifestyleHealth).pipe(
          map((response) =>
            UserActions.setLifestyleHealthSuccess({
              lifestyleHealth: response,
            }),
          ),
          catchError((error) => of(UserActions.userError({ error }))),
        ),
      ),
    ),
  );

  // Effect for updating Lifestyle Health
  updateLifestyleHealth$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.updateLifestyleHealth),
      mergeMap((action) =>
        this.registerService.updateLifestyleHealth(action.lifestyleHealth).pipe(
          map((response) =>
            UserActions.updateLifestyleHealthSuccess({
              lifestyleHealth: response,
            }),
          ),
          catchError((error) => of(UserActions.userError({ error }))),
        ),
      ),
    ),
  );

  // Effect for setting More Info
  setMoreInfo$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.setMoreInfo),
      mergeMap((action) =>
        this.registerService.setMoreInfo(action.moreInfo).pipe(
          map((response) =>
            UserActions.setMoreInfoSuccess({ moreInfo: response }),
          ),
          catchError((error) => of(UserActions.userError({ error }))),
        ),
      ),
    ),
  );

  // Effect for updating More Info
  updateMoreInfo$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.updateMoreInfo),
      mergeMap((action) =>
        this.registerService.updateMoreInfo(action.moreInfo).pipe(
          map((response) =>
            UserActions.updateMoreInfoSuccess({ moreInfo: response }),
          ),
          catchError((error) => of(UserActions.userError({ error }))),
        ),
      ),
    ),
  );

  // Effect for setting Resume
  setResume$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.setResume),
      mergeMap((action) =>
        this.registerService.setResume(action.resume).pipe(
          map((response) => UserActions.setResumeSuccess({ resume: response })),
          catchError((error) => of(UserActions.userError({ error }))),
        ),
      ),
    ),
  );

  // Effect for updating Resume
  updateResume$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.updateResume),
      mergeMap((action) =>
        this.registerService.updateResume(action.resume).pipe(
          map((response) =>
            UserActions.updateResumeSuccess({ resume: response }),
          ),
          catchError((error) => of(UserActions.userError({ error }))),
        ),
      ),
    ),
  );

  // Effect for setting Work Skills
  setWorkSkills$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.setWorkSkills),
      mergeMap((action) =>
        this.registerService.setWorkSkills(action.workSkills).pipe(
          map((response) =>
            UserActions.setWorkSkillsSuccess({ workSkills: response }),
          ),
          catchError((error) => of(UserActions.userError({ error }))),
        ),
      ),
    ),
  );

  // Effect for updating Work Skills
  updateWorkSkills$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.updateWorkSkills),
      mergeMap((action) =>
        this.registerService.updateWorkSkills(action.workSkills).pipe(
          map((response) =>
            UserActions.updateWorkSkillsSuccess({ workSkills: response }),
          ),
          catchError((error) => of(UserActions.userError({ error }))),
        ),
      ),
    ),
  );
}
