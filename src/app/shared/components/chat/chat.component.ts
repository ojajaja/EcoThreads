import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IonContent } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { ChatService } from '../../services/chat.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit {
  @ViewChild(IonContent, { static: false }) content: IonContent;
  discussionId: string;
  messages: any[] = [];
  newMessage: string = '';
  currentUserId: string;
  private chatSub: Subscription;

  constructor(
    private route: ActivatedRoute,
    private chatService: ChatService,
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.discussionId = params['discussionId'];
      if (this.discussionId) {
        this.initializeGroupChat(this.discussionId);
      }
    });
    this.currentUserId = this.chatService.currentUserId;
  }

  ngOnDestroy() {
    if (this.chatSub) {
      this.chatSub.unsubscribe();
    }
  }

  sendMessage() {
    if (this.newMessage.trim() === '') {
      return;
    }
    this.chatService.sendMessageToDiscussion(this.discussionId, this.newMessage)
      .then(() => {
        this.newMessage = '';
        this.scrollToBottom();
      })
      .catch(error => {
        console.error('Error sending message:', error);
      });
  }

  private scrollToBottom() {
    if (this.content) {
      this.content.scrollToBottom(300);
    }
  }

  private initializeGroupChat(discussionId: string) {
    this.chatSub = this.chatService.getGroupChatMessages(discussionId).subscribe(messages => {
      this.messages = messages;
      setTimeout(() => this.scrollToBottom(), 100);
    });
  }

}
