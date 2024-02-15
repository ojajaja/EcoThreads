import { Injectable } from '@angular/core';
import firebase from 'firebase/app';
import 'firebase/storage';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private db = firebase.firestore();

  constructor() {}

  getEvents(): Promise<Event[]> {
    return this.db.collection('events').get().then(querySnapshot => {
      return querySnapshot.docs.map(doc => {
        const data = doc.data() as Event;
        return { ...data, id: doc.id };
      });
    });
  }

  registerUserForEvent(eventId, userId) {
    const eventRef = this.db.collection('events').doc(eventId);
    return eventRef.update({
      registered: firebase.firestore.FieldValue.arrayUnion(userId)
    });
  }

  

}
