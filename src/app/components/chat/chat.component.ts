/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { CommonModule } from '@angular/common';
import {
  AfterViewChecked,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { easeIn } from '@animations/animations';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { EasifyService } from '@services/easify.service';
import { AppState } from '@store/app.state';
import {
  addMessage,
  clearMessages,
  sendMessageToChat,
} from '@store/chat/chat.actions';
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
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
  ],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
  animations: [easeIn],
})
export class ChatComponent implements OnDestroy, AfterViewChecked, OnChanges {
  @Input() isChatOpen = false;
  @Output() chatToggled = new EventEmitter<boolean>();
  @ViewChild('messageContainer') private messageContainer!: ElementRef;

  messages$: Observable<ChatMessage[]>;
  subscription = new Subscription();
  userMessage = '';
  isTyping = false;

  constructor(
    private chatService: EasifyService,
    private store: Store<AppState>,
    private actions$: Actions,
  ) {
    this.messages$ = this.store.select(selectAllMessages);
  }

  ngOnInit() {
    this.listenToActions();
  }

  private listenToActions(): void {
    this.subscription?.add(
      this.actions$.pipe(ofType(sendMessageToChat)).subscribe(({ message }) => {
        this.clearChatHistory();
        this.toggleChat(true);
        this.sendMessage(message);
      }),
    );
  }

  private clearChatHistory(): void {
    this.store.dispatch(clearMessages());
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isChatOpen'] && changes['isChatOpen'].currentValue) {
      this.checkAndAddGreetingMessage();
    }
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  toggleChat(toggle?: boolean): void {
    this.isChatOpen = toggle ?? !this.isChatOpen;
    this.chatToggled.emit(this.isChatOpen);

    if (this.isChatOpen && !toggle) {
      this.checkAndAddGreetingMessage();
    }
  }

  sendMessage(msg?: string): void {
    // Use the input `msg` parameter if provided; otherwise, fallback to `userMessage`
    const messageToSend = msg ?? this.userMessage;

    // Ensure the message is not empty or just whitespace
    if (messageToSend.trim()) {
      const userMsg: ChatMessage = { user: 'You', message: messageToSend };
      this.store.dispatch(addMessage({ message: userMsg }));

      // Show typing indicator
      this.isTyping = true;
      // Clear the input field only if the message came from the input box
      if (!msg) {
        this.userMessage = '';
        this.messages$.pipe(take(1)).subscribe((messages) => {
          const conversation = messages.slice(-10).map((msg) => ({
            user: msg.user === 'You' ? 'user' : 'assistant',
            message: msg.message,
          }));

          this.chatService
            .getChatResponse(messageToSend, conversation)
            .subscribe({
              next: (response) => {
                this.isTyping = false;
                const gptMsg: ChatMessage = { user: 'GPT', message: response };
                this.store.dispatch(addMessage({ message: gptMsg }));
              },
              error: (error) => {
                this.isTyping = false;
                console.error('Error:', error);
                const errorMsg: ChatMessage = {
                  user: 'System',
                  message: 'Error: Unable to get response from server.',
                };
                this.store.dispatch(addMessage({ message: errorMsg }));
              },
            });
        });
      } else {
        this.chatService.getChatResponse(messageToSend, [userMsg]).subscribe({
          next: (response) => {
            this.isTyping = false;
            const gptMsg: ChatMessage = { user: 'GPT', message: response };
            this.store.dispatch(addMessage({ message: gptMsg }));
          },
          error: (error) => {
            this.isTyping = false;
            console.error('Error:', error);
            const errorMsg: ChatMessage = {
              user: 'System',
              message: 'Error: Unable to get response from server.',
            };
            this.store.dispatch(addMessage({ message: errorMsg }));
          },
        });
      }
    }
  }

  private checkAndAddGreetingMessage(): void {
    this.messages$.pipe(take(1)).subscribe((messages) => {
      if (!messages || messages.length === 0) {
        this.isTyping = true;
        setTimeout(() => {
          this.isTyping = false;
          const greetingMessage: ChatMessage = {
            user: 'GPT',
            message: 'Hello! How can I assist you today?',
          };
          this.store.dispatch(addMessage({ message: greetingMessage }));
        }, 3000);
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
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
