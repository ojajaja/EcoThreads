import { Injectable } from '@angular/core';
import firebase from 'firebase/app';
import 'firebase/firestore';

@Injectable({
  providedIn: 'root',
})
export class LeaderboardService {
  aggregatedUsers: any[] = []; // Use a suitable type instead of any if possible

  constructor() {}

  async aggregatePointsByRegion() {
    const usersRef = firebase.firestore().collection(`leaderboards/Region/Users`);
    const snapshot = await usersRef.get();
    let pointsByRegion = {};

    snapshot.docs.forEach(doc => {
      const user = doc.data();
      if (user['region'] && user['points']) {
        pointsByRegion[user['region']] = (pointsByRegion[user['region']] || 0) + user['points'];
      }
    });

    this.aggregatedUsers = Object.keys(pointsByRegion).map(region => ({
      region: region,
      points: pointsByRegion[region]
    })).sort((a, b) => b.points - a.points);
  }

  getHighestScoringRegion() {
    return this.aggregatedUsers.length ? this.aggregatedUsers[0] : null;
  }
}
