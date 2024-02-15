import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import firebase from 'firebase/app';
import 'firebase/firestore';
import { formatDate } from '@angular/common';
import { AuthService } from '../shared/services/auth.service';
import 'firebase/storage';

interface User {
  id: string;
  name: string;
  points: number;
  photoUrl?: string;
  region?: string;
}

interface AggregatedUser {
  region: string;
  points: number;
}

@Component({
  selector: 'app-leaderboard-details',
  templateUrl: './region-leaderboard.page.html',
  styleUrls: ['./region-leaderboard.page.scss'],
})
export class RegionLeaderboardPage implements OnInit {

  users: User[] = [];
  leaderboardId: string | null = null;
  leaderboardCode: string | null = null;
  segmentValue: string = 'leaderboard';
  eventDateMessage: string = '';
  currentUserId: string;
  selectedRegion: string = '';
  aggregatedUsers: AggregatedUser[] = [];

  constructor(private route: ActivatedRoute, private authService: AuthService) {}

  ngOnInit() {
    this.authService.getCurrentUser().then(async(user) => {
      if (user) {
        this.currentUserId = user.uid;
        const region = await this.getCurrentUserRegion();
        this.checkUserRegion().then((hasRegion) => {
        });
        this.getLeaderboardDetails(this.leaderboardId);
        this.getLeaderboardUsers(region);
        this.setEventDateMessage();
        this.aggregatePointsByRegion();
        const currentUserUid = this.authService.getId();
      }
    }).catch(error => {
      console.error("Error fetching current user: ", error);
    });
  }

  segmentChanged(ev: any) {
    this.segmentValue = ev.detail.value;
  }

  // This method assumes you have a way to fetch all users and their points.
// It then aggregates points by region.
  async aggregatePointsByRegion() {
    const usersRef = firebase.firestore().collection(`leaderboards/Region/Users`);
    const snapshot = await usersRef.get();
    
    const pointsByRegion = {}; // Object to hold the sum of points by region
    
    snapshot.docs.forEach(doc => {
      const user = doc.data() as User;
      if (user.region && user.points) {
        pointsByRegion[user.region] = pointsByRegion[user.region] || 0;
        pointsByRegion[user.region] += user.points;
      }
    });
    
    // Convert the aggregated data into an array suitable for display
    this.aggregatedUsers = Object.keys(pointsByRegion).map(region => ({
      region: region,
      points: pointsByRegion[region]
    }));
    // Sort by points if needed
    this.aggregatedUsers.sort((a, b) => b.points - a.points);
  }


  async getLeaderboardUsers(region: string) {
    try {
      // First, get the current user's region
      const currentUserRegion = await this.getCurrentUserRegion();
      if (!currentUserRegion) {
        console.error("Current user does not have a region set.");
        return;
      }
  
      const usersRef = firebase.firestore().collection(`leaderboards/Region/Users`).where('region', '==', currentUserRegion);
      const snapshot = await usersRef.orderBy('points', 'desc').get();
      
      this.users = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data() as User,
      }));
  
      // Assuming you want to fetch the photo URL for each user
      for (let user of this.users) {
        user.photoUrl = await this.getUserPhotoUrl(user.id);
      }
  
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }

  async filterUsersByRegion() {
    if (!this.selectedRegion) {
      console.error("No region selected");
      return;
    }

    try {
      const usersRef = firebase.firestore().collection(`leaderboards/Region/Users`).where('region', '==', this.selectedRegion);
      const snapshot = await usersRef.orderBy('points', 'desc').get();
      
      this.users = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data() as User,
      }));

      for (let user of this.users) {
        user.photoUrl = await this.getUserPhotoUrl(user.id);
      }
    } catch (error) {
      console.error("Error fetching users by region:", error);
    }
  }

  async getCurrentUserRegion(): Promise<string | null> {
    const userRef = firebase.firestore().doc(`leaderboards/Region/Users/${this.currentUserId}`);
    const doc = await userRef.get();
    return doc.exists && doc.data()?.['region'] ? doc.data()['region'] : null;
  }
  
  async getLeaderboardDetails(leaderboardId: string) {
    try {
      const leaderboardRef = firebase.firestore().collection('leaderboards').doc('Region');
      const doc = await leaderboardRef.get();
      if (doc.exists) {
        this.leaderboardCode = doc.data()?.['code'];
      }
    } catch (error) {
      console.error("Error fetching leaderboard details:", error);
    }
  }

  async getUserPhotoUrl(userId: string): Promise<string> {
    const accountSnapshot = await firebase.firestore().collection('accounts').doc(userId).get();
    let photoUrl = accountSnapshot.data()?.['photo'];
  
    if (!photoUrl) {
      // User does not have a photo, fetch the default one from Firebase Storage
      const storageRef = firebase.storage().ref();
      photoUrl = await storageRef.child('profileImages/no_pp.png').getDownloadURL();
    }
  
    return photoUrl;
  }
  

  setEventDateMessage() {
    const today = new Date();
    const eventDate = this.getNextMatchingDate(today);
    this.eventDateMessage = eventDate.toDateString();
  }

  getNextMatchingDate(today: Date): Date {
    let month = today.getMonth() + 1;
    let year = today.getFullYear();
    let day = today.getDate();
    
    if (day > month) {
      month++;
      if (month > 12) {
        year++;
        month = 1;
      }
    }
    return new Date(year, month - 1, month);
  }

  isDateAndMonthSame(): boolean {
    const today = new Date();
    return today.getDate() === today.getMonth() + 1;
  }
  
  async checkUserRegion(): Promise<boolean> {
    const userRef = firebase.firestore().doc(`users/${this.currentUserId}`);
    try {
      const doc = await userRef.get();
      if (doc.exists && doc.data()['region']) {
        return true; // The user already has a region set
      }
      return false; // No region set for the user
    } catch (error) {
      console.error("Error checking user region: ", error);
      return false; // Assume no region is set if there's an error
    }
  }

  

}
