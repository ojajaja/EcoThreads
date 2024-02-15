import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';
import firebase from 'firebase'; 
import 'firebase/auth'; 

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  currentUser: any;

  observeAuthState(callback: (user: firebase.User | null) => void): void {
    firebase.auth().onAuthStateChanged(callback);
  }

  constructor(private toastController: ToastController) {}

  login(email: string, password: string) {
    return firebase.auth().signInWithEmailAndPassword(email, password);
  }

  logout() {
    return firebase.auth().signOut();
  }

  register(email: string, password: string) {
    return firebase.auth().createUserWithEmailAndPassword(email, password);
  }

  async resetPassword(email: string) {
    try {
      await firebase.auth().sendPasswordResetEmail(email);

      const toast = await this.toastController.create({
        message: 'Password reset email sent. Check your inbox.',
        duration: 2000,
      });
      toast.present();
    } catch (error) {
      const toast = await this.toastController.create({
        message: (error as Error).message,
        duration: 2000,
      });
      toast.present();
    }
  }

  getId(): string | undefined {
    const auth = firebase.auth();
    this.currentUser = auth.currentUser;
    return this.currentUser?.uid;
  }

  getCurrentUser(): Promise<firebase.User | null> {
    return new Promise((resolve, reject) => {
      const unsubscribe = firebase.auth().onAuthStateChanged(user => {
        unsubscribe();
        resolve(user);
      }, reject);
    });
  }

getEmail() {
  const user = firebase.auth().currentUser;
  return user ? user.email : null;
}

getCurrentUserEmail(): Promise<string | null> {
  return new Promise((resolve, reject) => {
    const user = firebase.auth().currentUser;
    if (user) {
      resolve(user.email);
    } else {
      reject('No authenticated user');
    }
  });
}



}
