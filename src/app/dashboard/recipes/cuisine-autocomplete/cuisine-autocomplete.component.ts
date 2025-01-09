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
import { RecipesService } from '@services/recipes.service';
import { map, Observable, startWith } from 'rxjs';
@Component({
  selector: 'app-cuisine-autocomplete',
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
  templateUrl: './cuisine-autocomplete.component.html',
  styleUrl: './cuisine-autocomplete.component.scss',
})
export class CuisineAutocompleteComponent implements OnInit {
  filteredCuisines!: Observable<string[]>;
  cuisineCtrl = new FormControl('');
  allCuisines: string[] = [];
  @Output() cuisineAdded = new EventEmitter<string>();

  constructor(private recipeService: RecipesService) {
    this.filteredCuisines = this.cuisineCtrl.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value ?? '')),
    );
  }

  ngOnInit(): void {
    // Fetch all cuisine types on initialization
    this.recipeService.getAllRecipeCuisines().subscribe((cuisines) => {
      this.allCuisines = cuisines;
      this.filteredCuisines = this.cuisineCtrl.valueChanges.pipe(
        startWith(''),
        map((value) => this._filterCuisines(value ?? '')),
      );
    });
  }

  addCuisineFromInput(): void {
    const value = this.cuisineCtrl.value?.trim();
    if (value) {
      this.cuisineAdded.emit(value);
      console.log('Added from input:', value);
      this.cuisineCtrl.setValue(''); // Clear the input field after adding
    }
  }

  addCuisine(event: any): void {
    const cuisine = event.option.value;
    if (cuisine) {
      this.cuisineAdded.emit(cuisine);
      console.log('Added from input:', cuisine);
      this.cuisineCtrl.setValue(''); // Clear the input field after adding
    }
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.allCuisines.filter((cuisine) =>
      cuisine.toLowerCase().includes(filterValue),
    );
  }

  private _filterCuisines(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.allCuisines.filter((cuisine) =>
      cuisine.toLowerCase().includes(filterValue),
    );
  }
}
