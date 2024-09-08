import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { EasifyService } from '../../../services/easify.service';
import { GrowthService } from '../../../services/growth.service';

@Component({
  selector: 'app-resume-upload',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule],
  templateUrl: './resume-upload.component.html',
  styleUrl: './resume-upload.component.scss',
})
export class ResumeUploadComponent implements OnInit {
  uploadForm: FormGroup;
  uploadMessage = '';
  isDragOver = false;
  uploadProgress: number | null = null;
  resumes: any[] = []; // Array to hold the fetched resumes

  constructor(
    private formBuilder: FormBuilder,
    private easifyService: EasifyService,
    private growthService: GrowthService,
  ) {
    this.uploadForm = this.formBuilder.group({
      resume: [''],
    });
  }

  // Initialize the component and fetch all resumes on load
  ngOnInit() {
    this.getUserResumes(); // Fetch resumes on component initialization
  }

  // Handle file input change for traditional file selection
  onFileChange(event: any) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.uploadForm.patchValue({
        resume: file,
      });
    }
  }

  // Handle file upload when "Upload" button is clicked
  uploadResume() {
    const file = this.uploadForm.get('resume')!.value;
    this.growthService.uploadResume(file, this.uploadProgress);
  }

  // Download resume function
  downloadResume(fileUrl: string) {
    console.log(fileUrl);
  }

  // Submit the resume to the backend for analysis
  submitResumeForAnalysis(filename: string) {
    this.easifyService.analyzeResume(filename).subscribe(
      () => {
        this.uploadMessage =
          'Resume uploaded to Firebase and sent for analysis successfully.';
      },
      (error) => {
        this.uploadMessage = 'Error uploading the resume.';
        console.error('Error:', error);
      },
    );
  }

  // Fetch all resumes for the authenticated user
  getUserResumes() {
    this.growthService
      .getUserResumes()
      .then((resumes) => {
        this.resumes = resumes; // Assign fetched resumes to the array
        console.log('Fetched resumes:', this.resumes);
      })
      .catch((error) => {
        console.error('Error fetching resumes:', error);
      });
  }

  // Drag and drop functionality
  @HostListener('dragover', ['$event'])
  onDragOver(event: any) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  @HostListener('dragleave', ['$event'])
  onDragLeave(event: any) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  @HostListener('drop', ['$event'])
  onDrop(event: any) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    const file = event.dataTransfer.files[0];
    if (file) {
      this.uploadForm.patchValue({
        resume: file,
      });
    }
  }
}
