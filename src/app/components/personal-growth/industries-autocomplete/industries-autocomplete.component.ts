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
import { GrowthService } from '@services/growth.service';
import { map, Observable, startWith } from 'rxjs';

@Component({
  selector: 'app-industries-autocomplete',
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
  templateUrl: './industries-autocomplete.component.html',
  styleUrl: './industries-autocomplete.component.scss',
})
export class IndustriesAutocompleteComponent implements OnInit {
  filteredIndustries!: Observable<string[]>;
  industryCtrl = new FormControl('');
  allIndustries: string[] = [];
  @Output() industryAdded = new EventEmitter<string>();

  constructor(private industryService: GrowthService) {
    this.filteredIndustries = this.industryCtrl.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value || '')),
    );
  }

  ngOnInit(): void {
    this.industryService.getAllIndustryTags().subscribe((industries) => {
      this.allIndustries = industries;
      this.filteredIndustries = this.industryCtrl.valueChanges.pipe(
        startWith(''),
        map((value) => this._filterIndustries(value || '')),
      );
    });
  }

  addIndustryFromInput(): void {
    const value = this.industryCtrl.value?.trim();
    if (value) {
      this.industryAdded.emit(value);
      console.log('Added from input:', value);
      this.industryCtrl.setValue(''); // Clear the input field after adding
    }
  }

  addIndustry(event: any): void {
    const industry = event.option.value;
    if (industry) {
      this.industryAdded.emit(industry);
      console.log('Added from input:', industry);
      this.industryCtrl.setValue(''); // Clear the input field after adding
    }
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.allIndustries.filter((industry) =>
      industry.toLowerCase().includes(filterValue),
    );
  }

  private _filterIndustries(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.allIndustries.filter((industry) =>
      industry.toLowerCase().includes(filterValue),
    );
  }
}
