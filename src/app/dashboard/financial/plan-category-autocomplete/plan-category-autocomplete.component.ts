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
import { FinancialPlansService } from '@services/financial.service';
import { map, Observable, startWith } from 'rxjs';

@Component({
  selector: 'app-plan-categories-autocomplete',
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
  templateUrl: './plan-category-autocomplete.component.html',
  styleUrl: './plan-category-autocomplete.component.scss',
})
export class PlanCategoryAutocompleteComponent implements OnInit {
  filteredCategories!: Observable<string[]>;
  categoryCtrl = new FormControl('');
  allCategories: string[] = [];
  @Output() categoryAdded = new EventEmitter<string>();

  constructor(private financialPlansService: FinancialPlansService) {
    this.filteredCategories = this.categoryCtrl.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value ?? '')),
    );
  }

  ngOnInit(): void {
    // Fetch all financial plan categories on initialization
    this.financialPlansService
      .getAllPortfolioCategories()
      .subscribe((categories) => {
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
