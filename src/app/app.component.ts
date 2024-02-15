import { Component } from '@angular/core';
import firebase from 'firebase';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  platform: any;

  constructor() {
        // Your web app's Firebase configuration
  var firebaseConfig = {
    apiKey: "AIzaSyBgq1te5E0SeHhKzO2MLDeL5dY_yRx-0PI",
    authDomain: "bipj-c3e99.firebaseapp.com",
    projectId: "bipj-c3e99",
    storageBucket: "bipj-c3e99.appspot.com",
    messagingSenderId: "239685928625",
    appId: "1:239685928625:web:96c5c51a0f84194e448490"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  }

  initializeApp(){
    this.platform.ready().then(() => {
});
  }
}
