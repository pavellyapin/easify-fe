/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @angular-eslint/prefer-output-readonly */
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { QuestionConfig } from '../question-config';

@Component({
  selector: 'app-question',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './question.component.html',
  styleUrl: './question.component.scss',
})
export class QuestionComponent implements OnInit {
  @Input() question!: QuestionConfig;
  @Output() optionSelected = new EventEmitter<string | string[]>();

  questionForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.initForm();
  }

  private initForm() {
    if (this.question.type === 'single') {
      this.questionForm = this.fb.group({
        answer: [''],
      });
    } else if (this.question.type === 'multiple') {
      const controls = this.question.options!.reduce<any>((acc, option) => {
        acc[option] = [false];
        return acc;
      }, {});
      this.questionForm = this.fb.group(controls);
    } else if (this.question.type === 'open') {
      this.questionForm = this.fb.group({
        answer: [''],
      });
    }
  }

  selectOption(option: string): void {
    this.questionForm.get('answer')?.setValue(option);
  }

  toggleOption(option: string): void {
    const control = this.questionForm.get(option);
    if (control) {
      control.setValue(!control.value);
    }
  }

  onSubmit() {
    if (this.question.type === 'multiple') {
      const selectedOptions = Object.keys(this.questionForm.value)
        .filter((key) => this.questionForm.get(key)?.value)
        .join(', ');
      this.optionSelected.emit(selectedOptions);
    } else {
      this.optionSelected.emit(this.questionForm.get('answer')?.value);
    }
  }
}
