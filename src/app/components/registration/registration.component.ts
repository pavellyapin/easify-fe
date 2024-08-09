/* eslint-disable @angular-eslint/consistent-component-styles */
import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { QUESTIONS, QuestionConfig } from './question-config';
import { QuestionComponent } from './question/question.component';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    QuestionComponent,
  ],
})
export class RegistrationComponent implements OnInit {
  formGroups: FormGroup[] = [];
  questions: QuestionConfig[] = QUESTIONS; // Assign questions config
  //answers$ = this.userService.getAnswersObservable();
  loading = false;

  @ViewChild('stepper')
  stepper!: MatStepper;

  constructor(
    private _formBuilder: FormBuilder,
    private authService: AuthService,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit() {
    // Create a form group for each question
    this.questions.forEach((_question, index) => {
      this.formGroups[index] = this._formBuilder.group({});
    });

    this.route.data.subscribe((data) => {
      const step = data['step'];
      console.log('Current step:', step); // Debugging log
      setTimeout(() => {
        this.stepper.selectedIndex = step - 1;
      });
    });
    /** 
    const answersObserver = {
      next: (
        answers: {
          questionId: number;
          question: string;
          answer: string | string[];
        }[],
      ) => {
        console.log('Answers:', answers);
      },
      error: (err: any) => {
        console.error('Error:', err);
      },
      complete: () => {
        console.log('Answers stream completed');
      },
    };

    this.answers$.subscribe(answersObserver); */
  }

  registerWithEmail() {
    if (this.formGroups[0]!.valid) {
      const { email, password } = this.formGroups[0]!.value;
      this.authService.registerWithEmail(email, password).subscribe({
        next: async (user) => {
          console.log('User registered with email:', user);
          await this.userService.saveUserToFirestore(user!);
          this.navigateToNextStep();
        },
        error: (error) => {
          console.error('Error registering user:', error);
        },
      });
    }
  }

  async registerWithGoogle() {
    this.authService.registerWithGoogle().subscribe({
      next: async (user) => {
        this.userService.isUserNew(user!.uid).subscribe({
          next: async (isNew) => {
            if (isNew) {
              await this.userService.saveUserToFirestore(user!);
              this.navigateToNextStep();
            } else {
              this.router.navigate(['/dashboard']);
            }
          },
          error: (error) => {
            console.error('Error checking if user is new:', error);
          },
        });
        console.log('User registered with Google:', user);
      },
      error: (error) => {
        console.error('Error registering user:', error);
      },
    });
  }

  onOptionSelected(option: string | string[], question: QuestionConfig) {
    console.log('Option selected:', option);
    this.saveQuestion(option, question);
  }

  async saveQuestion(answer: string | string[], question: QuestionConfig) {
    if (question) {
      this.loading = true;
      await this.userService.saveQuestionToFirestore(
        question.id,
        question.question,
        answer,
      );
      this.loading = false;
      this.navigateToNextStep();
    }
  }

  public navigateToNextStep() {
    const step = this.stepper.selectedIndex + 2;
    this.router.navigate([`/registration/s${step}`]);
  }

  public navigateToPreviousStep() {
    const step = this.stepper.selectedIndex;
    this.router.navigate([`/registration/s${step}`]);
  }

  onSubmit() {
    // Handle form submission
    console.log('Form Submitted');
  }
}
