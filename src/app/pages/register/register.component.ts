/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { AuthService } from '@services/auth.service';
import { UserService } from '@services/user.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    ReactiveFormsModule,
    MatInputModule,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  signupForm: FormGroup;
  hidePassword = true;
  hideConfirmPassword = true; // Variable to control confirm password visibility

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
  ) {
    this.signupForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    });
  }

  registerWithEmail() {
    // Check if the form is valid before attempting to register
    if (this.signupForm.valid) {
      const { email, password } = this.signupForm!.value;
      this.authService.registerWithEmail(email, password).subscribe({
        next: async (user) => {
          console.log('User registered with email:', user);
          await this.userService.saveUserToFirestore(user!);
          this.authService.toggleLoader(false);
          this.router.navigate(['/profile/edit']);
        },
        error: (error) => {
          console.error('Error registering user:', error);
        },
      });
    } else {
      // If the form is invalid, mark all controls as touched to trigger validation
      this.signupForm.markAllAsTouched();
    }
  }

  async registerWithGoogle() {
    this.authService.registerWithGoogle().subscribe({
      next: async (user) => {
        if (!user) {
          console.warn('Google sign-in popup closed by the user.');
          this.authService.toggleLoader(false); // Ensure loader is turned off
          return; // Exit early if the popup was closed
        }

        this.userService.isUserNew().subscribe({
          next: async (isNew) => {
            if (isNew) {
              await this.userService.saveUserToFirestore(user);
              this.authService.toggleLoader(false);
              this.router.navigate(['/profile/edit']);
            } else {
              this.authService.toggleLoader(false);
              this.router.navigate(['/dashboard']);
            }
          },
          error: (error) => {
            console.error('Error checking if user is new:', error);
            this.authService.toggleLoader(false); // Ensure loader is turned off
          },
        });
        console.log('User registered with Google:', user);
      },
      error: (error) => {
        // Check if the error indicates that the popup was closed
        if (error.message?.includes('popup-closed-by-user')) {
          console.warn('Google sign-in popup was closed by the user.');
        } else {
          console.error('Error registering user:', error);
        }
        this.authService.toggleLoader(false); // Ensure loader is turned off
      },
    });
  }

  // Register with Facebook
  async registerWithFacebook() {
    this.authService.registerWithFacebook().subscribe({
      next: async (user) => {
        this.userService.isUserNew().subscribe({
          next: async (isNew) => {
            if (isNew) {
              await this.userService.saveUserToFirestore(user!);
              this.authService.toggleLoader(false);
              this.router.navigate(['/profile/edit']);
            } else {
              this.authService.toggleLoader(false);
              this.router.navigate(['/dashboard']);
            }
          },
          error: (error) => {
            console.error('Error checking if user is new:', error);
          },
        });
        console.log('User registered with Facebook:', user);
      },
      error: (error) => {
        console.error('Error registering user with Facebook:', error);
      },
    });
  }

  // Register with Twitter (X)
  async registerWithX() {
    this.authService.registerWithX().subscribe({
      next: async (user) => {
        this.userService.isUserNew().subscribe({
          next: async (isNew) => {
            if (isNew) {
              await this.userService.saveUserToFirestore(user!);
              this.authService.toggleLoader(false);
              this.router.navigate(['/profile/edit']);
            } else {
              this.authService.toggleLoader(false);
              this.router.navigate(['/dashboard']);
            }
          },
          error: (error) => {
            console.error('Error checking if user is new:', error);
          },
        });
        console.log('User registered with Twitter:', user);
      },
      error: (error) => {
        console.error('Error registering user with Twitter:', error);
      },
    });
  }
  // Toggle password visibility
  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }
  // Toggle confirm password visibility
  toggleConfirmPasswordVisibility() {
    this.hideConfirmPassword = !this.hideConfirmPassword;
  }
}
