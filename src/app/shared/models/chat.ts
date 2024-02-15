import firebase from 'firebase/app';
import 'firebase/firestore';

export class ChatSession {
  id: string;
  members: string[];
  type: string;
  
    constructor(
      id: string,
    ) {
      this.id = id;
    }
  }

export interface Message {
  id?: string;
  messageText: string;
  sender: string;
  createdAt: firebase.firestore.Timestamp | Date | firebase.firestore.FieldValue;
  type: string;
}

export interface Account {
  uid: string;
  name: string;
  email: string;
  photo: string;
}
