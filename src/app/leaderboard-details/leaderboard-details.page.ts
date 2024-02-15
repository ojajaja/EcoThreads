import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import firebase from 'firebase/app';
import 'firebase/firestore';
import { ChartData, ChartOptions, ChartType } from 'chart.js';
import { BaseChartDirective, NgChartsModule } from 'ng2-charts';
import { formatDate } from '@angular/common';
import { AuthService } from '../shared/services/auth.service';
import 'firebase/storage';

interface User {
  id: string;
  name: string;
  points: number;
  photoUrl?: string;
}

@Component({
  selector: 'app-leaderboard-details',
  templateUrl: './leaderboard-details.page.html',
  styleUrls: ['./leaderboard-details.page.scss'],
})
export class LeaderboardDetailsPage implements OnInit {
  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;

  users: User[] = [];
  leaderboardId: string | null = null;
  leaderboardCode: string | null = null;
  segmentValue: string = 'leaderboard';
  eventDateMessage: string = '';

  public lineChartData: ChartData<'line'> = {
    datasets: [
      {
        data: [],
        label: 'Your Total Points By Month',
      },
    ],
    labels: [], 
  };
  
  public lineChartOptions: ChartOptions = {
    responsive: true,
  };
  
  public lineChartLegend = true;
  public lineChartType: ChartType = 'line';
  public lineChartPlugins = [];  

  constructor(private route: ActivatedRoute, private authService: AuthService) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.leaderboardId = params['id'];
      if (this.leaderboardId) {
        this.getLeaderboardDetails(this.leaderboardId);
        this.getLeaderboardUsers(this.leaderboardId);
        const currentUserUid = this.authService.getId();
        this.fetchPointsHistory(this.leaderboardId, currentUserUid);
      }
    });
    this.setEventDateMessage();
  }

  segmentChanged(ev: any) {
    this.segmentValue = ev.detail.value;
  }

  async getLeaderboardUsers(leaderboardId: string) {
    try {
      const usersRef = firebase.firestore().collection(`leaderboards/${leaderboardId}/Users`);
      const snapshot = await usersRef.orderBy('points', 'desc').get();
      
      this.users = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data() as User,
      }));

      this.users.forEach(async user => {
        user.photoUrl = await this.getUserPhotoUrl(user.id);
      });
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }

  async getLeaderboardDetails(leaderboardId: string) {
    try {
      const leaderboardRef = firebase.firestore().collection('leaderboards').doc(leaderboardId);
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
  
  async fetchPointsHistory(leaderboardId: string, userId: string) {
    const pointsHistoryRef = firebase.firestore()
      .collection(`leaderboards/${leaderboardId}/Users/${userId}/pointsHistory`);
    const snapshot = await pointsHistoryRef.orderBy('timestamp', 'asc').get();
  
    const highestData: { [key: string]: number } = {}; // To store the highest points by "YYYY-MM"
    
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      const points = data['points'];
      const timestamp: Date = data['timestamp'].toDate();
      const monthYearKey = `${timestamp.getFullYear()}-${timestamp.getMonth() + 1}`; // Format: "YYYY-MM"
  
      // Update the highest points for the month
      if (!highestData[monthYearKey] || points > highestData[monthYearKey]) {
        highestData[monthYearKey] = points;
      }
    });
  
    // Convert the highest data into arrays for the chart
    const chartData: number[] = [];
    const chartLabels: string[] = Object.keys(highestData).sort().map(key => {
      const [year, month] = key.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, 1); // Convert "YYYY-MM" back to a Date object
      chartData.push(highestData[key]); // Push the highest points for the month
      return `${date.toLocaleString('default', { month: 'short' })} ${year}`; // Format label as "Mon YYYY"
    });
  
    // Assign the highest points data to the chart's data and labels
    this.lineChartData.datasets[0].data = chartData;
    this.lineChartData.labels = chartLabels;
  
    this.chart.ngOnChanges({} as any);

  }
  
  

}
