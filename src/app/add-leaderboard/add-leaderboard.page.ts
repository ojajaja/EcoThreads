import { Component, OnInit } from '@angular/core';
import { AuthService } from '../shared/services/auth.service';
import firebase from 'firebase/app';
import 'firebase/firestore';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-leaderboard',
  templateUrl: './add-leaderboard.page.html',
  styleUrls: ['./add-leaderboard.page.scss'],
})
export class AddLeaderboardPage implements OnInit {
  leaderboardName: string;
  userName: string;

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit() {
  }

  generateRandomCode(length: number): string {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  async createLeaderboard() {
    const currentUserId = this.authService.getId(); // Replace with actual method to get the current user's ID
    const currentUserEmail = this.authService.getEmail(); // Method to get the current user's email
  
    if (!this.leaderboardName || !this.userName || !currentUserId || !currentUserEmail) {
      console.error('All fields are required');
      // Handle the error: all fields are required
      return;
    }
  
    try {
      const pointsRef = firebase.firestore().collection('points').doc(currentUserEmail);
      const pointsDoc = await pointsRef.get();
  
      let pointsBal = 0; // Default to 0 if there's no matching document
      if (pointsDoc.exists) {
        pointsBal = pointsDoc.data()['pointsBal'];
      }
  
      const code = this.generateRandomCode(10); // Generate a random code
      const leaderboardRef = firebase.firestore().collection('leaderboards').doc(this.leaderboardName);
      
      // Create the leaderboard document with the user's points balance
      await leaderboardRef.set({
        code: code, // Add the code to the leaderboard document
      });
  
      // Add the user to the leaderboard with their points balance
      const userRef = leaderboardRef.collection('Users').doc(currentUserId);
      await userRef.set({
        name: this.userName,
        points: pointsBal,
      });
  
      this.router.navigate(['/leaderboard']); // Adjust the path as per your routing configuration
      // Optionally navigate away or give success feedback
    } catch (error) {
      console.error("Error creating leaderboard:", error);
      // Optionally handle the error, such as displaying a user-friendly message
    }
  }
  

}
