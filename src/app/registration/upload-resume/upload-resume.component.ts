import { Component } from '@angular/core';
import { ResumeUploadComponent } from '@components/personal-growth/resume-upload/resume-upload.component';
import { Store } from '@ngrx/store';
import * as UserActions from '@store/user/user.action';
@Component({
  selector: 'app-upload-resume',
  standalone: true,
  imports: [ResumeUploadComponent],
  templateUrl: './upload-resume.component.html',
  styleUrl: './upload-resume.component.scss',
})
export class UploadResumeComponent {
  constructor(private store: Store) {}

  onResumeUploaded() {
    this.store.dispatch(UserActions.setResume({ resume: 'set' }));
  }
}
