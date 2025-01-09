/* eslint-disable @angular-eslint/prefer-output-readonly */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { RecipesService } from '@services/recipes.service';
import { map, Observable, startWith } from 'rxjs';

@Component({
  selector: 'app-ingredients-autocomplete',
  standalone: true,
  imports: [
    CommonModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
  ],
  templateUrl: './ingredients-autocomplete.component.html',
  styleUrl: './ingredients-autocomplete.component.scss',
})
export class IngredientsAutocompleteComponent implements OnInit {
  filteredIngredients!: Observable<string[]>;
  ingredientCtrl = new FormControl('');
  allIngredients: string[] = [];
  @Output() ingredientAdded = new EventEmitter<string>();
  constructor(private recipesService: RecipesService) {
    this.filteredIngredients = this.ingredientCtrl.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value || '')),
    );
  }

  ngOnInit(): void {
    this.recipesService.getAllIngredients().subscribe((ingredients) => {
      this.allIngredients = ingredients;
      this.filteredIngredients = this.ingredientCtrl.valueChanges.pipe(
        startWith(''),
        map((value) => this._filterIngredients(value || '')),
      );
    });
  }

  addIngredientFromInput(): void {
    const value = this.ingredientCtrl.value?.trim();
    if (value) {
      // Emit the value using the ingredientAddedFromInput output event
      this.ingredientAdded.emit(value);
      console.log('Added from input:', value);
      this.ingredientCtrl.setValue(''); // Clear the input field after adding
    }
  }

  addIngredient(event: any): void {
    const ingredient = event.option.value;
    if (ingredient) {
      // Emit the value using the ingredientAddedFromInput output event
      this.ingredientAdded.emit(ingredient);
      console.log('Added from input:', ingredient);
      this.ingredientCtrl.setValue(''); // Clear the input field after adding
    }
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.allIngredients.filter((ingredient) =>
      ingredient.toLowerCase().includes(filterValue),
    );
  }

  private _filterIngredients(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.allIngredients.filter((ingredient) =>
      ingredient.toLowerCase().includes(filterValue),
    );
  }
}
