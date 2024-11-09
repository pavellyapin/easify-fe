/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @angular-eslint/prefer-output-readonly */
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { CapitalizePipe } from '@services/capitalize.pipe';
import { FitnessWorkoutsService } from '@services/fitness.service';
import { map, Observable, startWith } from 'rxjs';
@Component({
  selector: 'app-workout-category-autocomplete',
  standalone: true,
  imports: [
    CommonModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    CapitalizePipe,
  ],
  templateUrl: './workout-category-autocomplete.component.html',
  styleUrl: './workout-category-autocomplete.component.scss',
})
export class WorkoutCategoryAutocompleteComponent implements OnInit {
  filteredCategories!: Observable<string[]>;
  categoryCtrl = new FormControl('');
  allCategories: string[] = [];
  @Output() categoryAdded = new EventEmitter<string>();

  constructor(private workoutService: FitnessWorkoutsService) {
    this.filteredCategories = this.categoryCtrl.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value ?? '')),
    );
  }

  ngOnInit(): void {
    // Fetch all workout categories on initialization
    this.workoutService.getAllWorkoutCategories().subscribe((categories) => {
      this.allCategories = categories;
      this.filteredCategories = this.categoryCtrl.valueChanges.pipe(
        startWith(''),
        map((value) => this._filterCategories(value ?? '')),
      );
    });
  }

  addCategoryFromInput(): void {
    const value = this.categoryCtrl.value?.trim();
    if (value) {
      this.categoryAdded.emit(value);
      console.log('Added from input:', value);
      this.categoryCtrl.setValue(''); // Clear the input field after adding
    }
  }

  addCategory(event: any): void {
    const category = event.option.value;
    if (category) {
      this.categoryAdded.emit(category);
      console.log('Added from input:', category);
      this.categoryCtrl.setValue(''); // Clear the input field after adding
    }
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.allCategories.filter((category) =>
      category.toLowerCase().includes(filterValue),
    );
  }

  private _filterCategories(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.allCategories.filter((category) =>
      category.toLowerCase().includes(filterValue),
    );
  }
}
