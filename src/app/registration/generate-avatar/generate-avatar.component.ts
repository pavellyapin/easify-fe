/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/unbound-method */
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { EasifyService } from '@services/easify.service';
import { UserService } from '@services/user.service';
import { setProfileLoading } from '@store/loader/loading.actions';
import { setProfileInfo } from '@store/user/user.action';

@Component({
  selector: 'app-generate-avatar',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatRadioModule,
    MatInputModule,
    MatCardModule,
    MatIconModule,
    MatSelectModule,
    MatButtonModule,
  ],
  templateUrl: './generate-avatar.component.html',
  styleUrl: './generate-avatar.component.scss',
})
export class GenerateAvatarComponent {
  avatarForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private easifyService: EasifyService,
    private store: Store,
    private router: Router,
  ) {
    this.avatarForm = this.fb.group({
      name: [''], // Optional name
      gender: ['', Validators.required],
      ageRange: ['', Validators.required],
      ethnicity: ['', Validators.required],
      hairColor: [''],
      eyeColor: [''],
      clothingStyle: [''],
      accessories: [''],
      otherInfo: [''],
    });
  }

  onSubmit(): void {
    if (this.avatarForm.valid) {
      const formData = this.avatarForm.value;
      this.store.dispatch(setProfileLoading({ isLoading: true }));
      // Save avatar info in user profile using UserService
      this.userService
        .saveAvatarData(formData)
        .then(() => {
          console.log('Avatar info saved. Now generating avatar...');

          // After saving, call EasifyService to generate the avatar
          this.easifyService.generateAvatar().subscribe({
            next: (response) => {
              this.store.dispatch(setProfileInfo());
              this.navigateTo('profile/details');
              this.store.dispatch(setProfileLoading({ isLoading: false }));
              console.log('Avatar generated successfully:', response);
              // You can handle the generated avatar URL (response.avatarUrl) here, like saving it in Firestore
            },
            error: (error) => {
              this.store.dispatch(setProfileLoading({ isLoading: false }));
              console.error('Error generating avatar:', error);
            },
          });
        })
        .catch((error) => {
          console.error('Error saving avatar info:', error);
        });
    }
  }
  // Function to navigate to a specific route (e.g., dashboard sections)
  navigateTo(route: string): void {
    this.router.navigate([route]);
  }
}
