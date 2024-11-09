/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FirebaseApp } from '@angular/fire/app';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { AlertCardComponent } from '@components/alert-card/alert-card.component'; // Import selectors
import { Loader } from '@googlemaps/js-api-loader';
import { Store } from '@ngrx/store';
import * as UserActions from '@store/user/user.action'; // Import actions
import * as UserSelectors from '@store/user/user.selector';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-basic-info',
  templateUrl: './basic-info.component.html',
  styleUrl: './basic-info.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatRadioModule,
    MatInputModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    NgxMatTimepickerModule,
    AlertCardComponent,
  ],
})
export class BasicInfoComponent implements OnInit {
  basicInfoForm!: FormGroup;
  private autocomplete!: google.maps.places.Autocomplete;
  basicInfo$: Observable<any>;

  constructor(
    private firebaseApp: FirebaseApp,
    private store: Store,
  ) {
    // Select the basicInfo from the store
    this.basicInfo$ = this.store.select(UserSelectors.selectBasicInfo);
  }

  ngOnInit(): void {
    // Initialize the form
    this.basicInfoForm = new FormGroup({
      name: new FormControl(''),
      city: new FormControl(''),
      gender: new FormControl(''),
      wakeUpTime: new FormControl(''),
      sleepTime: new FormControl(''),
    });

    // Prepopulate form with existing basicInfo if it exists in the store
    this.basicInfo$.pipe(take(1)).subscribe((basicInfo) => {
      if (basicInfo) {
        this.basicInfoForm.patchValue(basicInfo);
      }
    });

    // Load Google Places API using Firebase's auto-configured API key
    const loader = new Loader({
      apiKey: this.firebaseApp.options.apiKey!,
      version: 'weekly',
      libraries: ['places'],
    });

    loader.importLibrary('places').then(() => {
      const input = document.getElementById('city-input') as HTMLInputElement;
      if (input) {
        this.autocomplete = new google.maps.places.Autocomplete(input, {
          types: ['(cities)'],
          componentRestrictions: { country: ['ca', 'us'] }, // Restrict to Canada and US
        });

        this.autocomplete.addListener('place_changed', () => {
          const place = this.autocomplete.getPlace();
          const addressComponents = place.address_components;

          let city = '';
          let province = '';
          let country = '';

          addressComponents?.forEach((component) => {
            const types = component.types;
            if (types.includes('locality')) {
              city = component.long_name;
            }
            if (types.includes('administrative_area_level_1')) {
              province = component.long_name; // Province or State
            }
            if (types.includes('country')) {
              country = component.long_name;
            }
          });

          // Concatenate city, province, and country into a single field
          const fullCity = `${city}, ${province}, ${country}`;

          // Set the concatenated value in the city field
          this.basicInfoForm.get('city')?.setValue(fullCity);
        });
      }
    });
  }

  // Handle form submission
  onSubmit(): void {
    if (this.basicInfoForm.valid) {
      const basicInfo = this.basicInfoForm.value;
      // Dispatch the action to set basic info in the store
      this.store.dispatch(UserActions.setBasicInfo({ basicInfo }));
    }
  }
}
