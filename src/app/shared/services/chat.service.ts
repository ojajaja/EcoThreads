import { Injectable } from '@angular/core';
import { combineLatest, Observable, from, of } from 'rxjs';
import { catchError, map, switchMap, take } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { FirestoreService } from './firestore.service';
import firebase from 'firebase/app';
import 'firebase/firestore';
import { Account, Message } from '../models/chat';


@Injectable({
  providedIn: 'root'
})
export class ChatService {

  currentUserId: string;
  public users: Observable<any>;
  public chatRooms: Observable<any>;
  public selectedChatRoomMessages: Observable<any>;
  public otherUserName: string = '';

  constructor(public auth: AuthService, private fireStore: FirestoreService) {
    this.auth.observeAuthState(user => {
      if (user) {
        this.currentUserId = user.uid;
      } else {
        this.currentUserId = null;
      }
    });
  }

  setCurrentUserId(userId: string): void {
    this.currentUserId = userId;
  }

  getId() {
    console.log(this.currentUserId);
    this.currentUserId = this.auth.getId();
  }

  getUsers() {
    this.users = this.fireStore.collectionDataQuery(
      'users',
      this.fireStore.whereQuery('uid', '!=', this.currentUserId)
    );
  }

  createChatRoom(user_id: any): Observable<any> {
    return new Observable(observer => {
      this.fireStore.getDocs(
        'chatRooms',
        this.fireStore.whereQuery(
          'members',
          'in',
          [[user_id, this.currentUserId], [this.currentUserId, user_id]]
        )
      ).subscribe(
        async (rooms) => {
          if (rooms.length > 0) {
            observer.next(rooms[0]);
          } else {
            try {
              const data = {
                members: [
                  this.currentUserId,
                  user_id
                ],
                type: 'private',
                createdAt: new Date(),
                updatedAt: new Date(),
              };
              const newRoom = await this.fireStore.addDocument('chatRooms', data);
              observer.next(newRoom);
            } catch (e) {
              observer.error(e);
            }
          }
        },
        (error) => {
          observer.error(error);
        }
      );
    });
  }

  getChatRooms() {
    this.getId();
    console.log(this.currentUserId);
    this.chatRooms = this.fireStore.collectionDataQuery(
      'chatRooms',
      this.fireStore.whereQuery('members', 'array-contains', this.currentUserId)
    ).pipe(
      map((data: any[]) => {
        console.log('room data: ', data);
        data.map((element) => {
          const user_data = element.members.filter(x => x != this.currentUserId);
          console.log(user_data);
          const user = this.fireStore.docDataQuery(`users/${user_data[0]}`, true);
          element.user = user;
        });
        return (data);
      }),
      switchMap(data => {
        return of(data);
      })
    );
  }

  getChatRoomMessages(chatRoomId: string) {
    this.selectedChatRoomMessages = this.fireStore.getMessagesByChatSession(chatRoomId);
    map((messages: Message[]) => messages.map(message => ({
      ...message,
      createdAt: this.convertTimestampToDate(message.createdAt)
    })
    ));
  }

  private convertTimestampToDate(timestamp: firebase.firestore.Timestamp | Date | firebase.firestore.FieldValue): Date {
    if (timestamp instanceof firebase.firestore.Timestamp) {
      return timestamp.toDate();
    } else if (timestamp instanceof Date) {
      return timestamp;
    } else {
      console.error("Invalid timestamp format:", timestamp);
      return new Date();
    }
  }

// Assumes Message interface has a 'type' field now.
sendMessage(chatSessionId: string, content: string, type: 'text' | 'image') {
  if (!this.currentUserId || !content.trim()) {
    console.error('Current user ID is undefined or content is empty.');
    return;
  }

  const message: Message = {
    messageText: content,
    sender: this.currentUserId,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    type // New field indicating the message type
  };

  this.fireStore.addMessageToChatSession(chatSessionId, message)
    .then(() => console.log('Message sent.'))
    .catch(error => console.error('Error sending message:', error));
}

  getOtherParticipantName(chatSessionId: string): Observable<string> {
    return this.fireStore.docDataQuery(`chatSession/${chatSessionId}`).pipe(
      take(1),
      switchMap(chatRoom => {
        const otherUserId = chatRoom.members.find(memberId => memberId !== this.currentUserId);
        return this.fireStore.docDataQuery(`accounts/${otherUserId}`);
      }),
      map((account: Account) => account.name)
    );
  }

  //discussion codes

  sendMessageToDiscussion(discussionId: string, messageText: string): Promise<void> {
    if (!this.currentUserId) {
      return Promise.reject('No user logged in');
    }
    const message: Message = {
      sender: this.currentUserId,
      messageText: messageText,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      type: 'text'
    };
    return this.fireStore.addMessageToDiscussion(discussionId, message);
  }

  getGroupChatMessages(discussionId: string): Observable<any[]> {
    return this.fireStore.getMessagesFromDiscussion(discussionId).pipe(
      switchMap((messages: Message[]) => {
        if (messages.length === 0) {
          // If there are no messages, return an observable of an empty array
          return of([]);
        }
  
        const userObservables = messages.map(message => {
          // Convert Timestamp to Date if necessary
          const createdAtDate = message.createdAt instanceof firebase.firestore.Timestamp
            ? message.createdAt.toDate()
            : message.createdAt instanceof Date
              ? message.createdAt
              : new Date(); // Fallback to current date, but consider adjusting based on your logic
  
          return this.getUserNameById(message.sender).pipe(
            map(name => ({
              ...message,
              senderName: name,
              createdAt: createdAtDate
            }))
          );
        });
  
        // CombineLatest requires an array of Observables
        return combineLatest(userObservables);
      })
    );
  }
  

  getUserNameById(userId: string): Observable<string> {
    return this.fireStore.getAccountByUserId(userId).pipe(
      map((account: Account) => account.name),
      catchError(() => of('Unknown User'))
    );
  }

  //new chat
  // async newChat(userOneId: string, userTwoId: string): Promise<any> {
  //   if (!userOneId || !userTwoId || userOneId === userTwoId) {
  //     throw new Error('Invalid user IDs. Cannot create chat with the same or empty user IDs.');
  //   }
  //   // check if there is a chat with these members
  //   try {
  //     const existingChat = await this.fireStore.getDocs(
  //       'chatSession',
  //       this.fireStore.whereQuery(
  //         'members',
  //         'in',
  //         [[userOneId, userTwoId], [userTwoId, userOneId]]
  //       )
  //     ).pipe(take(1)).toPromise();
  //     if (existingChat.length > 0) {
  //       return existingChat[0];
  //     } else {
  //       const newChatData = {
  //         members: [userOneId, userTwoId],
  //         type: 'private',
  //         createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  //         updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
  //       };
  //       const newChatSession = await this.fireStore.addDocument('chatSession', newChatData);
  //       return { new: true, session: newChatSession };
  //     }
  //   } catch (error) {
  //     throw new Error(`Error in newChat function: ${error.message}`);
  //   }
  // }


}
