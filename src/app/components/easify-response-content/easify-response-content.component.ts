/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Store } from '@ngrx/store';
import { OrderByPipe } from '@services/order-by.pipe';
import { sendMessageToChat } from '@store/chat/chat.actions';

@Component({
  selector: 'app-easify-response-content',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, OrderByPipe],
  templateUrl: './easify-response-content.component.html',
  styleUrl: './easify-response-content.component.scss',
})
export class EasifyResponseContentComponent {
  @Input()
  easifyResponse: any;
  @Input()
  context: any;
  @Output() readonly backClicked = new EventEmitter<void>(); // Define output property
  constructor(private store: Store) {}

  // Emit the backClicked event when the button is clicked
  onBackClick(): void {
    this.backClicked.emit();
  }

  sendTitleToChat(): void {
    if (this.easifyResponse?.response.title) {
      this.store.dispatch(
        sendMessageToChat({
          message: this.context + ' ' + this.easifyResponse.response.title,
        }),
      );
    } else {
      console.error('No title found in the easify response');
    }
  }
  isArray(value: any): boolean {
    return Array.isArray(value);
  }
}
