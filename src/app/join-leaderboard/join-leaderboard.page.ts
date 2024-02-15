import { Component, OnInit } from '@angular/core';
import firebase from 'firebase/app';
import 'firebase/firestore';
import { AuthService } from '../shared/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-join-leaderboard',
  templateUrl: './join-leaderboard.page.html',
  styleUrls: ['./join-leaderboard.page.scss'],
})
export class JoinLeaderboardPage implements OnInit {
  leaderboardCode: string;
  userName: string;

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit() {
  }

  async joinLeaderboard() {
    const currentUserId = this.authService.getId();
    const currentUserEmail = this.authService.getEmail(); // Method to get the current user's email

    if (!this.leaderboardCode || !this.userName || !currentUserEmail) {
      // Handle the error: all fields are required
      console.error('All fields are required');
      return;
    }

    try {
      const leaderboardsRef = firebase.firestore().collection('leaderboards');
      const pointsRef = firebase.firestore().collection('points').doc(currentUserEmail);
      const pointsDoc = await pointsRef.get();
      console.log(currentUserEmail);
      let pointsBal = 0; // Default to 0 if there's no matching document
      if (pointsDoc.exists) {
        // Assuming the email field in the points collection is unique and only returns one document
        pointsBal = pointsDoc.data()['pointsBal'];
      }
      console.log(pointsBal);
      const querySnapshot = await leaderboardsRef.where('code', '==', this.leaderboardCode).get();

      if (querySnapshot.empty) {
        console.error('Invalid leaderboard code');
        return;
      }

      const leaderboardRef = querySnapshot.docs[0].ref;
      const userRef = leaderboardRef.collection('Users').doc(currentUserId);
      await userRef.set({
        name: this.userName,
        points: pointsBal,
      });
      this.router.navigate(['/leaderboard']); // Adjust the path as per your routing configuration

      // Optionally navigate away or give success feedback
    } catch (error) {
      console.error("Error joining leaderboard:", error);
      // Optionally handle the error, such as displaying a user-friendly message
    }
  }
}
