import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../shared/services/auth.service';
import firebase from 'firebase/app';
import 'firebase/firestore';
import { LeaderboardService } from '../shared/services/leaderboard.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit, OnDestroy {
  countdownDisplay!: string;
  barWidth = '100%';
  private totalTime = 24 * 60 * 60; // 24 hours in seconds
  private countdownTime = (12 * 60 * 60) + (24 * 60); // 18 hours and 24 minutes in seconds
  private intervalId: any;
  // private slideshowIntervalId: any; // Separate interval for slideshow
  currentSlide = 0;
  Individual = 'Individual';
  highestScoringRegion: string | null = null;

  slides = [
    { image: 'assets/homepage/popup-banner.jpg' },
    { image: 'assets/homepage/chrismas-banner.jpg' },
    { image: 'assets/homepage/jan-sale-banner.jpg' },
  ];

  slideChangeInterval: any;
  currentUserRanking: string | null = null;

  constructor(private router: Router, private authService: AuthService, private leaderboardService: LeaderboardService) {}
  
  async ngOnInit() {
    this.startCountdown(this.countdownTime);
    this.startSlideshow();
    this.getCurrentUserRanking();
    await this.leaderboardService.aggregatePointsByRegion();
    this.displayHighestScoringRegion();
  }

  ngOnDestroy() {
    clearInterval(this.intervalId);
  }

  startSlideshow() {
    this.slideChangeInterval = setInterval(() => {
      this.currentSlide = ++this.currentSlide % this.slides.length;
    }, 3000); // Change slide every 3 seconds
  }

  startCountdown(seconds: number) {
    const initialSeconds = seconds;
    this.updateDisplay(seconds); // Initialize the display immediately
  
    this.intervalId = setInterval(() => {
      seconds--;
      this.updateDisplay(seconds);
  
      // Calculate the width of the green bar based on the elapsed time
      const elapsedPercentage = ((this.totalTime - seconds) / this.totalTime) * 100;
      this.barWidth = elapsedPercentage + '%';
  
      if (seconds <= 0) {
        clearInterval(this.intervalId);
        this.countdownDisplay = '00:00:00';
        this.barWidth = '0%'; // The green bar should be empty when countdown ends
      }
    }, 1000);
  }
  

  updateDisplay(totalSeconds: number) {
    const hours = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
  
    this.countdownDisplay = `${this.pad(hours)}:${this.pad(minutes)}:${this.pad(seconds)}`;
  }
  
  pad(number: number) {
    return number < 10 ? '0' + number : number.toString();
  }
  

  // 4 button tab navigations
  navigateScan(){
    this.router.navigate([''])
  }
  navigateWallet(){
    this.router.navigate([''])
  }
  navigateTracker(){
    this.router.navigate(['tracking-home'])
  }
  navigatePoints(){
    this.router.navigate([''])
  }

    // 8 button tab navigation
    navigateMarket(){
      this.router.navigate([''])
    }
    navigateMap(){
      this.router.navigate([''])
    }
    navigateRewards(){
      this.router.navigate([''])
    }
    navigateLeaderboard(){
      this.router.navigate(['leaderboard'])
    }

    navigateChat() {
      this.router.navigate(['chat'])
    }

    navigateEvent() {
      this.router.navigate(['events'])
    }

  //leaderboard
  async getCurrentUserRanking() {
    const currentUserId = this.authService.getId();
    if (!currentUserId) return;

    const usersRef = firebase.firestore().collection('leaderboards/Individual/Users');
    const querySnapshot = await usersRef.orderBy('points', 'desc').get();
    
    let rank = 1;
    querySnapshot.forEach(doc => {
      if (doc.id === currentUserId) {
        this.currentUserRanking = this.ordinalSuffixOf(rank);
      }
      rank++;
    });
  }

  displayHighestScoringRegion() {
    const highestRegion = this.leaderboardService.getHighestScoringRegion();
    if (highestRegion) {
      this.highestScoringRegion = highestRegion.region;
    } else {
      this.highestScoringRegion = 'No data';
    }
  }

  private ordinalSuffixOf(i: number) {
    const j = i % 10,
          k = i % 100;
    if (j === 1 && k !== 11) {
        return i + "st";
    }
    if (j === 2 && k !== 12) {
        return i + "nd";
    }
    if (j === 3 && k !== 13) {
        return i + "rd";
    }
    return i + "th";
  }
    
}
