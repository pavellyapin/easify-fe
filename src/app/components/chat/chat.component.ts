/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { CommonModule } from '@angular/common';
import {
  AfterViewChecked,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Store } from '@ngrx/store';
import { EasifyService } from '@services/easify.service';
import { AppState } from '@store/app.state';
import { addMessage } from '@store/chat/chat.actions';
import { selectAllMessages } from '@store/chat/chat.selectors';
import { Observable, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

interface ChatMessage {
  user: string;
  message: string;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
  ],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
})
export class ChatComponent implements OnDestroy, AfterViewChecked {
  messages$: Observable<ChatMessage[]>;
  subscription: Subscription | null = null;
  userMessage = '';
  isTyping = false;
  isChatOpen = false;

  @ViewChild('messageContainer') private messageContainer!: ElementRef;

  constructor(
    private chatService: EasifyService,
    private store: Store<AppState>,
  ) {
    this.messages$ = this.store.select(selectAllMessages);
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  toggleChat() {
    this.isChatOpen = !this.isChatOpen;
  }

  sendMessage() {
    if (this.userMessage.trim()) {
      const messageToSend = this.userMessage; // Capture the user message
      const userMsg: ChatMessage = { user: 'You', message: this.userMessage };
      this.store.dispatch(addMessage({ message: userMsg }));
      this.userMessage = ''; // Clear the input field after dispatching

      // Show typing indicator
      this.isTyping = true;

      // Capture the conversation history once
      this.messages$.pipe(take(1)).subscribe((messages) => {
        // Limit to the last 10 messages
        const conversation = messages.slice(-10).map((msg) => ({
          role: msg.user === 'You' ? 'user' : 'assistant',
          content: msg.message,
        }));

        // Make the API call with the captured conversation
        this.chatService
          .getChatResponse(messageToSend, conversation)
          .subscribe({
            next: (response) => {
              this.isTyping = false; // Hide typing indicator
              const gptMsg: ChatMessage = {
                user: 'GPT',
                message: response,
              };
              this.store.dispatch(addMessage({ message: gptMsg }));
            },
            error: (error) => {
              this.isTyping = false; // Hide typing indicator
              console.error('Error:', error);
              const errorMsg: ChatMessage = {
                user: 'System',
                message: 'Error: Unable to get response from server.',
              };
              this.store.dispatch(addMessage({ message: errorMsg }));
            },
          });
      });
    }
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe(); // Clean up subscription on component destroy
  }

  private scrollToBottom(): void {
    try {
      if (this.messageContainer) {
        this.messageContainer.nativeElement.scrollTop =
          this.messageContainer.nativeElement.scrollHeight;
      }
    } catch (err) {
      console.error('Could not scroll to bottom:', err);
    }
  }
}
