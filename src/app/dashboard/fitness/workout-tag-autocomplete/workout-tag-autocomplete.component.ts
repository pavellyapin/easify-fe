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
  selector: 'app-workout-tag-autocomplete',
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
  templateUrl: './workout-tag-autocomplete.component.html',
  styleUrl: './workout-tag-autocomplete.component.scss',
})
export class WorkoutTagAutocompleteComponent implements OnInit {
  filteredTags!: Observable<string[]>;
  tagCtrl = new FormControl('');
  allTags: string[] = [];
  @Output() tagAdded = new EventEmitter<string>();

  constructor(private workoutService: FitnessWorkoutsService) {
    this.filteredTags = this.tagCtrl.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value ?? '')),
    );
  }

  ngOnInit(): void {
    // Fetch all workout tags on initialization
    this.workoutService.getAllWorkoutTags().subscribe((tags) => {
      this.allTags = tags;
      this.filteredTags = this.tagCtrl.valueChanges.pipe(
        startWith(''),
        map((value) => this._filterTags(value ?? '')),
      );
    });
  }

  addTagFromInput(): void {
    const value = this.tagCtrl.value?.trim();
    if (value) {
      this.tagAdded.emit(value);
      this.tagCtrl.setValue(''); // Clear the input field after adding
    }
  }

  addTag(event: any): void {
    const tag = event.option.value;
    if (tag) {
      this.tagAdded.emit(tag);
      this.tagCtrl.setValue(''); // Clear the input field after adding
    }
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.allTags.filter((tag) =>
      tag.toLowerCase().includes(filterValue),
    );
  }

  private _filterTags(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.allTags.filter((tag) =>
      tag.toLowerCase().includes(filterValue),
    );
  }
}
