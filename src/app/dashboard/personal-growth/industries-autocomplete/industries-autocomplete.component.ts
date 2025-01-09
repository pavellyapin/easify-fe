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
    CapitalizePipe,
  ],
  templateUrl: './industries-autocomplete.component.html',
  styleUrl: './industries-autocomplete.component.scss',
})
export class IndustriesAutocompleteComponent implements OnInit {
  filteredIndustries!: Observable<string[]>;
  industryCtrl = new FormControl('');
  allIndustries: string[] = [];
  @Output() industryAdded = new EventEmitter<string>();

  constructor(private growthService: GrowthService) {
    this.filteredIndustries = this.industryCtrl.valueChanges.pipe(
      startWith(''),
      map((value) => this._filterIndustries(value ?? '')),
    );
  }

  ngOnInit(): void {
    // Fetch all industries on initialization
    this.growthService.getAllIndustryTags().subscribe((industries) => {
      this.allIndustries = industries;
      this.filteredIndustries = this.industryCtrl.valueChanges.pipe(
        startWith(''),
        map((value) => this._filterIndustries(value ?? '')),
      );
    });
  }

  addIndustryFromInput(): void {
    const value = this.industryCtrl.value?.trim();
    if (value) {
      this.industryAdded.emit(value);
      console.log('Added from input:', value);
      this.industryCtrl.setValue(''); // Clear the input field after adding
      this.industryCtrl.reset();
    }
  }

  addIndustry(event: any): void {
    const industry = event.option.value;
    if (industry) {
      this.industryAdded.emit(industry);
      console.log('Added from autocomplete:', industry);
      this.industryCtrl.setValue(''); // Clear the input field after adding
    }
  }

  private _filterIndustries(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.allIndustries.filter((industry) =>
      industry.toLowerCase().includes(filterValue),
    );
  }
}
