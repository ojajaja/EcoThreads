import { Component, OnInit } from '@angular/core';
import firebase from 'firebase/app';
import { AuthService } from '../shared/services/auth.service';
import { Router } from '@angular/router';
import { AlertController, AlertInput } from '@ionic/angular';
import 'firebase/firestore';

@Component({
  selector: 'app-leaderboard',
  templateUrl: './leaderboard.page.html',
  styleUrls: ['./leaderboard.page.scss'],
})
export class LeaderboardPage implements OnInit {

  leaderboards: any[] = [];
  currentUserId: string;
  selectedRegion: string;

  constructor(private authService: AuthService, private router: Router, private alertController: AlertController) { }

  ngOnInit() {
    this.authService.getCurrentUser().then((user) => {
      if (user) {
        this.currentUserId = user.uid;
        this.getUserLeaderboards();
      }
    }).catch(error => {
      console.error("Error fetching current user: ", error);
    });  
  }

  ionViewWillEnter() {
    this.getUserLeaderboards(); // This will make sure the latest data is loaded every time the page is entered.
  }

  getUserLeaderboards() {
    if (!this.currentUserId) return;

    const leaderboardsRef = firebase.firestore().collection('leaderboards');
    leaderboardsRef.get().then(snapshot => {
      const leaderboardDataPromises = snapshot.docs.map(doc => this.calculateUserRank(doc.ref, this.currentUserId));
      return Promise.all(leaderboardDataPromises);
    }).then(leaderboardsData => {
      // Filter out leaderboards where the user is not present
      this.leaderboards = leaderboardsData.filter(leaderboard => leaderboard !== null);
    }).catch(error => {
      console.error("Error fetching leaderboards: ", error);
    });
  }

  calculateUserRank(leaderboardRef: firebase.firestore.DocumentReference, userId: string): Promise<any | null> {
    return leaderboardRef.collection('Users').orderBy('points', 'desc').get().then(snapshot => {
      let rank = 1;
      let userRankData = null;
      snapshot.forEach(doc => {
        if (doc.id === userId) {
          userRankData = { name: leaderboardRef.id, rank: rank, points: doc.data()['points'] };
        }
        rank++;
      });
      return userRankData;
    });
  }

  async onLeaderboardClick(leaderboard: any) {
    if (leaderboard.name === 'Region') {
      // Check if the user already has a region set
      const userDocRef = firebase.firestore().doc(`/leaderboards/Region/Users/${this.currentUserId}`);
      userDocRef.get().then(docSnapshot => {
        if (docSnapshot.exists && docSnapshot.data()['region']) {
          console.log("User already has a region set.");
          // Optionally navigate to the leaderboard details page or handle as needed
          this.router.navigate(['/region-leaderboard']);
        } else {
          // If the user does not have a region, show the alert to select one
          this.presentAreaAlert();
        }
      }).catch(error => {
        console.error("Error checking user's region:", error);
      });
    } else {
      this.navigateToLeaderboardDetails(leaderboard.name);
    }
  }
  

  async presentAreaAlert() {
    const alert = await this.alertController.create({
      header: 'Select Your Area',
      inputs: this.getAreaInputs(),
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Selection canceled');
          }
        },
        {
          text: 'OK',
          handler: (selectedArea) => {
            console.log('Selected area:', selectedArea);
            this.selectedRegion = selectedArea;
            this.updateUserRegion();
          }
        }
      ]
    });
  
    await alert.present();
  }
  

  getAreaInputs(): AlertInput[] {
    return [
      { name: 'Ang Mo Kio', type: 'radio', label: 'Ang Mo Kio (North-East)', value: 'North-East' },
      { name: 'Bedok', type: 'radio', label: 'Bedok (East)', value: 'East' },
      { name: 'Bishan', type: 'radio', label: 'Bishan (Central)', value: 'Central' },
      { name: 'Boon Lay', type: 'radio', label: 'Boon Lay (West)', value: 'West' },
      { name: 'Bukit Batok', type: 'radio', label: 'Bukit Batok (West)', value: 'West' },
      { name: 'Bukit Merah', type: 'radio', label: 'Bukit Merah (Central)', value: 'Central' },
      { name: 'Bukit Panjang', type: 'radio', label: 'Bukit Panjang (West)', value: 'West' },
      { name: 'Bukit Timah', type: 'radio', label: 'Bukit Timah (Central)', value: 'Central' },
      { name: 'Central Water Catchment', type: 'radio', label: 'Central Water Catchment (North)', value: 'North' },
      { name: 'Changi', type: 'radio', label: 'Changi (East)', value: 'East' },
      { name: 'Changi Bay', type: 'radio', label: 'Changi Bay (East)', value: 'East' },
      { name: 'Choa Chu Kang', type: 'radio', label: 'Choa Chu Kang (West)', value: 'West' },
      { name: 'Clementi', type: 'radio', label: 'Clementi (West)', value: 'West' },
      { name: 'Downtown Core', type: 'radio', label: 'Downtown Core (Central)', value: 'Central' },
      { name: 'Geylang', type: 'radio', label: 'Geylang (Central)', value: 'Central' },
      { name: 'Hougang', type: 'radio', label: 'Hougang (North-East)', value: 'North-East' },
      { name: 'Jurong East', type: 'radio', label: 'Jurong East (West)', value: 'West' },
      { name: 'Jurong West', type: 'radio', label: 'Jurong West (West)', value: 'West' },
      { name: 'Kallang', type: 'radio', label: 'Kallang (Central)', value: 'Central' },
      { name: 'Lim Chu Kang', type: 'radio', label: 'Lim Chu Kang (North)', value: 'North' },
      { name: 'Mandai', type: 'radio', label: 'Mandai (North)', value: 'North' },
      { name: 'Marina East', type: 'radio', label: 'Marina East (Central)', value: 'Central' },
      { name: 'Marina South', type: 'radio', label: 'Marina South (Central)', value: 'Central' },
      { name: 'Marine Parade', type: 'radio', label: 'Marine Parade (Central)', value: 'Central' },
      { name: 'Museum', type: 'radio', label: 'Museum (Central)', value: 'Central' },
      { name: 'Newton', type: 'radio', label: 'Newton (Central)', value: 'Central' },
      { name: 'North-Eastern Islands', type: 'radio', label: 'North-Eastern Islands', value: 'North-East' },
      { name: 'Novena', type: 'radio', label: 'Novena (Central)', value: 'Central' },
      { name: 'Orchard', type: 'radio', label: 'Orchard (Central)', value: 'Central' },
      { name: 'Outram', type: 'radio', label: 'Outram (Central)', value: 'Central' },
      { name: 'Pasir Ris', type: 'radio', label: 'Pasir Ris (East)', value: 'East' },
      { name: 'Paya Lebar', type: 'radio', label: 'Paya Lebar (East)', value: 'East' },
      { name: 'Pioneer', type: 'radio', label: 'Pioneer (West)', value: 'West' },
      { name: 'Punggol',type: 'radio', label: 'Punggol (North-East)', value: 'North-East' },
      { name: 'Queenstown', type: 'radio', label: 'Queenstown (Central)', value: 'Central' },
      { name: 'River Valley', type: 'radio', label: 'River Valley (Central)', value: 'Central' },
      { name: 'Rochor', type: 'radio', label: 'Rochor (Central)', value: 'Central' },
      { name: 'Seletar', type: 'radio', label: 'Seletar (North-East)', value: 'North-East' },
      { name: 'Sembawang', type: 'radio', label: 'Sembawang (North)', value: 'North' },
      { name: 'Sengkang', type: 'radio', label: 'Sengkang (North-East)', value: 'North-East' },
      { name: 'Serangoon', type: 'radio', label: 'Serangoon (North-East)', value: 'North-East' },
      { name: 'Simpang', type: 'radio', label: 'Simpang (North)', value: 'North' },
      { name: 'Singapore River', type: 'radio', label: 'Singapore River (Central)', value: 'Central' },
      { name: 'Southern Islands', type: 'radio', label: 'Southern Islands (Central)', value: 'Central' },
      { name: 'Straits View', type: 'radio', label: 'Straits View (Central)', value: 'Central' },
      { name: 'Sungei Kadut', type: 'radio', label: 'Sungei Kadut (North)', value: 'North' },
      { name: 'Tampines', type: 'radio', label: 'Tampines (East)', value: 'East' },
      { name: 'Tanglin', type: 'radio', label: 'Tanglin (Central)', value: 'Central' },
      { name: 'Tengah', type: 'radio', label: 'Tengah (West)', value: 'West' },
      { name: 'Toa Payoh', type: 'radio', label: 'Toa Payoh (Central)', value: 'Central' },
      { name: 'Tuas', type: 'radio', label: 'Tuas (West)', value: 'West' },
      { name: 'Western Islands', type: 'radio', label: 'Western Islands (West)', value: 'West' },
      { name: 'Western Water Catchment', type: 'radio', label: 'Western Water Catchment (West)', value: 'West' },
      { name: 'Woodlands', type: 'radio', label: 'Woodlands (North)', value: 'North' },
      { name: 'Yishun', type: 'radio', label: 'Yishun (North)', value: 'North' },
    ];
  }

  updateUserRegion() {
    const userDocRef = firebase.firestore().doc(`/leaderboards/Region/Users/${this.currentUserId}`);
  
    userDocRef.get().then(docSnapshot => {
      if (docSnapshot.exists) {
        const userData = docSnapshot.data();
  
        // Check if the 'region' field exists
        if (!userData || !userData.hasOwnProperty('region')) {
          // 'region' field does not exist, update the document to add it
          userDocRef.update({
            region: this.selectedRegion
          }).then(() => {
            console.log("User's region updated to:", this.selectedRegion);
          }).catch(error => {
            console.error("Error updating user's region:", error);
          });
        } else {
          // 'region' field exists
          console.log("User already has a region set.");
        }
      } else {
        console.log("User document does not exist.");
      }
    }).catch(error => {
      console.error("Error fetching user document:", error);
    });
  }
  
  navigateToLeaderboardDetails(leaderboardName: string) {
    // Implement navigation logic, for example using Angular Router
    this.router.navigate(['/leaderboard-details', leaderboardName]);
  }

}
