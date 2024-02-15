import { Injectable } from '@angular/core';
import firebase from 'firebase/app';
import 'firebase/firestore';
import { Observable } from 'rxjs';
import { Account, ChatSession, Message } from '../models/chat';
import 'firebase/auth';
import { Events } from '../models/events';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  private db = firebase.firestore();
  private auth = firebase.auth();
  private storage = firebase.storage();
  private eventsRef = firebase.firestore().collection("events");

  constructor() { }

  getCurrentUserId(): Observable<string> {
    return new Observable<string>(observer => {
      this.auth.onAuthStateChanged((user) => {
        if (user) {
          observer.next(user.uid);
        } else {
          observer.error('No user logged in');
        }
      });
    });
  }

  getChatSessionsByUserId(userId: string): Observable<ChatSession[]> {
    return new Observable<ChatSession[]>(observer => {
      const query = this.db.collection('chatSession')
        .where('members', 'array-contains', userId);

      query.onSnapshot(snapshot => {
        const sessions: ChatSession[] = [];
        snapshot.forEach(doc => {
          const session = { id: doc.id, ...doc.data() } as ChatSession;
          sessions.push(session);
        });
        observer.next(sessions);
      }, error => {
        observer.error(error);
      });
    });
  }

  getAccountByUserId(userId: string): Observable<Account> {
    return new Observable<Account>(observer => {
      this.db.collection('accounts').doc(userId).get().then(doc => {
        if (doc.exists) {
          observer.next(doc.data() as Account);
        } else {
          observer.error('No account found for the given user ID');
        }
      }).catch(error => {
        observer.error(error);
      });
    });
  }


  collectionDataQuery(path: string, queryFn?: (ref: firebase.firestore.CollectionReference) => firebase.firestore.Query): Observable<any[]> {
    return new Observable<any[]>(observer => {
      let collectionRef = this.db.collection(path);
      if (queryFn) {
        const query = queryFn(collectionRef);
        query.get().then(snapshot => {
          const documents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          observer.next(documents);
        }).catch(error => {
          observer.error(error);
        });
      } else {
        collectionRef.get().then(snapshot => {
          const documents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          observer.next(documents);
        }).catch(error => {
          observer.error(error);
        });
      }
    });
  }

  whereQuery(fieldPath: string, operation: firebase.firestore.WhereFilterOp, value: any): (ref: firebase.firestore.CollectionReference) => firebase.firestore.Query {
    return ref => ref.where(fieldPath, operation, value);
  }

  orderByQuery(fieldPath: string, directionStr: firebase.firestore.OrderByDirection = 'asc'): (ref: firebase.firestore.CollectionReference) => firebase.firestore.Query {
    return ref => ref.orderBy(fieldPath, directionStr);
  }

  docDataQuery(path: string, includeId: boolean = false): Observable<any> {
    return new Observable<any>(observer => {
      this.db.doc(path).get().then(doc => {
        if (doc.exists) {
          let data = doc.data();
          if (includeId) {
            data = { id: doc.id, ...data };
          }
          observer.next(data);
        } else {
          console.error(`Document not found at path: ${path}`);
          observer.error(new Error(`Document not found at path: ${path}`));
        }
      }).catch(error => {
        console.error(`Error retrieving document at path: ${path}`, error);
        observer.error(new Error(`Error retrieving document at path: ${path}: ${error.message}`));
      });
    });
  }


  addDocument(collectionPath: string, data: any): Promise<firebase.firestore.DocumentReference> {
    const collectionRef = this.db.collection(collectionPath);
    return collectionRef.add(data);
  }

  getDocs(collectionPath: string, queryFn?: (ref: firebase.firestore.CollectionReference) => firebase.firestore.Query): Observable<any[]> {
    return new Observable<any[]>(observer => {
      let collectionRef = this.db.collection(collectionPath);
      if (queryFn) {
        const query = queryFn(collectionRef);
        query.get().then(snapshot => {
          const documents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          observer.next(documents);
        }).catch(error => {
          observer.error(error);
        });
      } else {
        collectionRef.get().then(snapshot => {
          const documents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          observer.next(documents);
        }).catch(error => {
          observer.error(error);
        });
      }
    });
  }

  getMessagesByChatSession(chatSessionId: string): Observable<Message[]> {
    return new Observable(observer => {
      this.db.collection(`chatSession/${chatSessionId}/Messages`)
        .orderBy('createdAt', 'asc')
        .onSnapshot(snapshot => {
          const messages = snapshot.docs.map(doc => {
            const data = doc.data() as Message;
            return {
              ...data,
              id: doc.id,
              createdAt: (data.createdAt instanceof firebase.firestore.Timestamp) ? data.createdAt.toDate() : data.createdAt
            };
          });
          observer.next(messages);
        }, error => {
          observer.error(error);
        });
    });
  }
  

  async sendMessage(chatSessionId: string, messageData: Message): Promise<void> {
    const messagesRef = this.db.collection(`chatSession/${chatSessionId}/Messages`);
    await messagesRef.add(messageData);
  }

  addMessageToChatSession(chatSessionId: string, message: any): Promise<void> {
    return new Promise((resolve, reject) => {
      const messagesRef = this.db.collection('chatSession').doc(chatSessionId).collection('Messages');

      messagesRef.add(message)
        .then(docRef => {
          console.log(`Message added with ID: ${docRef.id}`);
          resolve();
        })
        .catch(error => {
          console.error('Error adding message to chatSession:', error);
          reject(error);
        });
    });
  }

  getChatSessionById(chatId: string): Observable<any> {
    return new Observable(observer => {
      this.db.collection('chatSessions').doc(chatId).get().then(doc => {
        if (doc.exists) {
          observer.next(doc.data());
        } else {
          observer.error('Chat session not found');
        }
      }).catch(error => {
        observer.error(error);
      });
    });
  }

  getUserById(userId: string): Observable<any> {
    return new Observable(observer => {
      this.db.collection('users').doc(userId).get().then(doc => {
        if (doc.exists) {
          observer.next(doc.data());
        } else {
          observer.error('User not found');
        }
      }).catch(error => {
        observer.error(error);
      });
    });
  }

  getLastMessage(chatSessionId: string): Observable<Message | null> {
    return new Observable(observer => {
      this.db.collection(`chatSession/${chatSessionId}/Messages`)
        .orderBy('createdAt', 'desc')
        .limit(1)
        .onSnapshot(snapshot => {
          if (!snapshot.empty) {
            const lastMessageData = snapshot.docs[0].data();
            const lastMessage = { ...lastMessageData, id: snapshot.docs[0].id } as Message;
            observer.next(lastMessage);
          } else {
            observer.next(null);
          }
        }, error => observer.error(error));
    });
  }
  

  getCollection(collectionName: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.db.collection(collectionName).get()
        .then(snapshot => {
          let results: any[] = [];
          snapshot.forEach(doc => {
            results.push({ id: doc.id, ...doc.data() });
          });
          resolve(results);
        })
        .catch(error => reject(error));
    });
  }

  getMessagesFromDiscussion(discussionId: string): Observable<Message[]> {
    return new Observable(observer => {
      this.db.collection(`discussions/${discussionId}/messages`)
        .orderBy('createdAt', 'asc')
        .onSnapshot(snapshot => {
          const messages = snapshot.docs.map(doc => {
            const data = doc.data();
            const createdAt = data['createdAt'] as firebase.firestore.Timestamp;
            return {
              id: doc.id,
              ...data,
              createdAt: createdAt
            } as Message;
          });
          observer.next(messages);
        }, error => {
          observer.error(error);
        });
    });
  }
  

  addMessageToDiscussion(discussionId: string, message: Message): Promise<void> {
    return this.db.collection(`discussions/${discussionId}/messages`).add(message)
      .then(() => console.log('Message sent to discussion group chat.'))
      .catch(error => {
        console.error('Error sending message:', error);
        throw error;
      });
  }

//Events

getEvents(): Observable<Events[]> {
  return new Observable(observer => {
    this.eventsRef.onSnapshot(querySnapshot => {
      let eventsPromises = querySnapshot.docs.map(doc => {
        let data = doc.data();
        let event = new Events(
          data['eventName'],
          data['eventDesc'],
          data['eventStartDate'],
          data['eventEndDate'],
          data['eventBanner'],
          data['eventVenue'],
          data['uid'],
          doc.id
        );

        if (data['eventBanner']) {
          const imageRef = firebase.storage().ref().child(`Events/${data['eventBanner']}`);
          return imageRef.getDownloadURL()
            .then(url => {
              event.eventBanner = url;
              return event;
            }).catch(error => {
              console.error('Failed to get image URL:', error);
              return event;
            });
        } else {
          return Promise.resolve(event);
        }
      });

      Promise.all(eventsPromises).then(eventsArray => {
        observer.next(eventsArray);
      }).catch(error => {
        console.error('Error fetching events:', error);
        observer.error(error);
      });
    }, error => {
      observer.error(error);
    });
  });
}

//event-details
getEventById(id: string): Observable<any> {
  return new Observable((observer) => {
    this.eventsRef.doc(id).get().then((doc) => {
      if (!doc.exists) {
        observer.error(new Error('No event found'));
        return;
      }

      let data = doc.data();
      let event = new Events(
        data!['eventName'],
        data!['eventDesc'],
        data!['eventStartDate'],
        data!['eventEndDate'],
        data!['eventBanner'],
        data!['eventVenue'],
        data!['uid'],
        doc.id,
        data!['registered']
      );

      if (data!['eventBanner']) {
        const imageRef = firebase.storage().ref().child(`Events/${data['eventBanner']}`);
        imageRef.getDownloadURL().then(url => {
          event.eventBanner = url;
          observer.next(event);
        }).catch(error => {
          console.error('Failed to get image URL:', error);
          observer.next(event);
        });
      } else {
        observer.next(event);
      }
    }).catch(error => {
      console.error('Error getting event:', error);
      observer.error(error);
    });
  });
}

getEventsByUserId(userId: string): Observable<Events[]> {
  return new Observable((observer) => {
    firebase.firestore().collection('events').where('uid', '==', userId)
    .onSnapshot(querySnapshot => {
      let eventsArray: Events[] = [];
      querySnapshot.forEach(doc => {
        let data = doc.data();
        let event = new Events(
          data['eventName'],
          data['eventDesc'],
          data['eventStartDate'],
          data['eventEndDate'],
          data['eventBanner'],
          data['eventVenue'],
          data['uid'],
          doc.id
        );
        eventsArray.push(event);
      });
      observer.next(eventsArray);
    }, error => observer.error(error));
  });
}

updateEvent(eventId: string, eventData: any): Promise<void> {
  const docRef = firebase.firestore().collection('events').doc(eventId);
  return docRef.update(eventData);
}
  
addEvent(eventData: Events): Promise<void> {
  return new Promise((resolve, reject) => {
    this.db.collection('events').add({
      eventName: eventData.eventName,
      eventDesc: eventData.eventDesc,
      eventStartDate: eventData.eventStartDate,
      eventEndDate: eventData.eventEndDate,
      eventVenue: eventData.eventVenue,
      eventBanner: eventData.eventBanner,
      uid: firebase.auth().currentUser?.uid
    }).then(docRef => {
      console.log('Document written with ID: ', docRef.id);
      resolve();
    }).catch(error => {
      console.error('Error adding document: ', error);
      reject(error);
    });
  });
}

deleteEvent(eventId: string): Promise<void> {
  const firestore = firebase.firestore();
  const eventRef = firestore.collection('events').doc(eventId);
  
  // Delete the event document
  return eventRef.delete();
}

async addEventWithImage(eventData: Events, imageFile: File): Promise<void> {
  try {
    const uniqueImageName = `${Date.now()}_${imageFile.name}`;
    const imageRef = this.storage.ref(`Events/${uniqueImageName}`);
    await imageRef.put(imageFile);
    await this.db.collection('events').add({
      ...eventData,
      eventBanner: uniqueImageName,
      uid: this.auth.currentUser?.uid || '' 
    });
  } catch (error) {
    console.error('Error adding event with image: ', error);
    throw error;
  }
}

getRegisteredEventsByUserId(userId: string): Observable<Events[]> {
  return new Observable<Events[]>(observer => {
    this.db.collection('events')
      .where('registered', 'array-contains', userId)
      .onSnapshot(querySnapshot => {
        let eventsArray: Events[] = [];
        querySnapshot.forEach(doc => {
          let data = doc.data();
          let event = new Events(
            data['eventName'],
            data['eventDesc'],
            data['eventStartDate'],
            data['eventEndDate'],
            data['eventBanner'],
            data['eventVenue'],
            data['uid'],
            doc.id
          );
          eventsArray.push(event);
        });
        observer.next(eventsArray);
      }, error => observer.error(error));
  });
}
}
