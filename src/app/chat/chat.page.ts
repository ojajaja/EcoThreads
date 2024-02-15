import { Component, OnInit } from '@angular/core';
import { FirestoreService } from '../shared/services/firestore.service';
import { ChatSession } from '../shared/models/chat';
import { ActivatedRoute, Router } from '@angular/router';
import { ChatService } from '../shared/services/chat.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {
  segmentValue: string = 'direct';
  public chats: ChatSession[] = [];
  public discussions: any[] = [];
  currentUserId!: string;
  namesMap = new Map<string, string>();
  photosMap = new Map<string, string>();
  lastMessage: string;
  chatSessionId: string;
  public lastMessagesMap = new Map<string, string>();
  private subscriptions: Subscription[] = [];

  constructor(private firestore: FirestoreService, private router: Router, private chatService: ChatService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.initCurrentUserId();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  private initCurrentUserId() {
    const sub = this.firestore.getCurrentUserId().subscribe(
      userId => {
        this.currentUserId = userId;
        this.loadChatSessions();
        this.loadDiscussions();
      },
      error => console.error('Error getting current user ID:', error)
    );
    this.subscriptions.push(sub);
  }

  segmentChanged(ev: any) {
    this.segmentValue = ev.detail.value;
  }

  loadChatSessions() {
    const sub = this.firestore.getChatSessionsByUserId(this.currentUserId).subscribe(
      sessions => {
        this.chats = sessions;
        this.updateChatSessions(sessions);
      },
      error => console.error('Error getting chat sessions for the current user:', error)
    );
    this.subscriptions.push(sub);
  }
  
  private updateChatSessions(sessions: ChatSession[]) {
    sessions.forEach(session => {
      const otherUserId = session.members.find(member => member !== this.currentUserId);
      if (otherUserId) {
        this.updateAccountDetails(otherUserId);
        this.listenForLastMessage(session.id);
      }
    });
  }

  private updateAccountDetails(userId: string) {
    const sub = this.firestore.getAccountByUserId(userId).subscribe(
      account => {
        this.namesMap.set(userId, account.name);
        this.photosMap.set(userId, account.photo);
      },
      error => {
        console.error('Error getting account details:', error);
        this.namesMap.set(userId, "Unknown User");
        this.photosMap.set(userId, "");
      }
    );
    this.subscriptions.push(sub);
  }

  private listenForLastMessage(sessionId: string) {
    const sub = this.firestore.getLastMessage(sessionId).subscribe(
      lastMessage => {
        if (lastMessage) {
          const displayText = this.isImageUrl(lastMessage.messageText) ? 'Image' : lastMessage.messageText;
          this.lastMessagesMap.set(sessionId, displayText);
        } else {
          this.lastMessagesMap.set(sessionId, 'No messages yet.');
        }
      },
      error => {
        console.error('Error getting last message:', error);
        this.lastMessagesMap.set(sessionId, 'Error fetching message.');
      }
    );
    this.subscriptions.push(sub);
  }
  
  getChat(item: any) {
    this.router.navigate(['/', 'direct', item?.id]);
  }

  goToDiscussion(discussionId: string) {
    this.router.navigate(['/discussions', discussionId]);
  }

  private isImageUrl(messageContent: string): boolean {
    // This regex checks for a Firebase Storage URL that includes '/o/' and '?alt=media'
    const firebaseStorageRegex = /^https:\/\/firebasestorage\.googleapis\.com\/v0\/b\/[^\/]+\/o\/.+?\?alt=media/;
    return firebaseStorageRegex.test(messageContent);
  }
  
  loadDiscussions() {
    this.firestore.getCollection('discussions')
      .then((discussionDocs: any[]) => {
        // Map the document array to include only the document ID as the title
        this.discussions = discussionDocs.map(d => ({ id: d.id }));
      })
      .catch(error => {
        console.error('Error fetching discussions:', error);
      });
  }

}
