/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, Inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { catchError, map, of } from 'rxjs';
import { EasifyService } from '../../../services/easify.service';
import { AppState } from '../../../store/app.state';
import { setLoading } from '../../../store/loader/loading.actions';
import {
  loadNewRecipeFailure,
  loadNewRecipeSuccess,
} from '../../../store/recipe/recipe.actions';

@Component({
  selector: 'app-meal-prep-model',
  standalone: true,
  imports: [
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    FormsModule,
    MatRadioModule,
    ReactiveFormsModule,
  ],
  templateUrl: './meal-prep-model.component.html',
  styleUrl: './meal-prep-model.component.scss',
})
export class MealPrepModelComponent implements OnInit {
  mealForm!: FormGroup;
  constructor(
    public dialogRef: MatDialogRef<MealPrepModelComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private chatService: EasifyService,
    private store: Store<AppState>,
    private router: Router,
  ) {}

  ngOnInit(): void {
    // Initialize the form with default values
    this.mealForm = this.fb.group({
      meal: [this.data.recommendations],
      difficulty: [this.data.difficulty || 'easy', Validators.required],
      servings: [
        this.data.servings || 1,
        [Validators.required, Validators.min(1)],
      ],
    });
  }

  submit(): void {
    if (this.mealForm.valid) {
      // Pass the form values back to the caller
      this.store.dispatch(setLoading(true));
      this.chatService
        .getRecipe(this.mealForm.value)
        .pipe(
          map((newRecipe) => {
            this.store.dispatch(loadNewRecipeSuccess({ newRecipe }));
            this.store.dispatch(setLoading(false));
            this.router.navigate(['dashboard/newRecipe']);
            return true;
          }),
          catchError((error) => {
            console.error('Error generating schedule:', error);
            this.store.dispatch(loadNewRecipeFailure({ error }));
            this.store.dispatch(setLoading(false));
            return of(false);
          }),
        )
        .subscribe();
      this.dialogRef.close(this.mealForm.value);
    }
  }
}
