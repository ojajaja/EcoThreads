import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Events } from '../shared/models/events';
import { ActivatedRoute, Router } from '@angular/router';
import { FirestoreService } from '../shared/services/firestore.service';
import firebase from 'firebase/app';
import 'firebase/firestore';
import { Account } from '../shared/models/chat';
import { AuthService } from '../shared/services/auth.service';
import { EventService } from '../shared/services/event.service';
import { ToastController } from '@ionic/angular';
declare var google: any;

@Component({
  selector: 'app-event-details',
  templateUrl: './event-details.page.html',
  styleUrls: ['./event-details.page.scss'],
})
export class EventDetailsPage implements OnInit {
  event: Events | undefined;
  userName: string = '';
  currentUserUid: string | undefined;
  isUserRegistered: boolean = false;
  showMap: boolean = true;

  constructor(private toastController: ToastController, private eventService: EventService, private activatedRoute: ActivatedRoute, private firestoreService: FirestoreService, private router: Router, private authService: AuthService, private changeDetector: ChangeDetectorRef) { }

  ngOnInit() {
    this.currentUserUid = this.authService.getId(); 
    this.loadEventDetails();
    const eventId = this.activatedRoute.snapshot.paramMap.get('id');
    if (eventId) {
      this.firestoreService.getEventById(eventId).subscribe(event => {
        this.event = event;
        if (this.event?.uid) {
          this.getUserName(this.event.uid);
        }
      }, error => {
        console.error('Error fetching event:', error);
      });
    } else {
      console.error('Event ID is null');
    }
  }

  private loadEventDetails() {
    const eventId = this.activatedRoute.snapshot.paramMap.get('id');
    if (eventId) {
      this.firestoreService.getEventById(eventId).subscribe(event => {
        this.event = event;
        if (this.event?.uid) {
          this.getUserName(this.event.uid);
        }
        this.isUserRegistered = Array.isArray(this.event['registered']) && this.event['registered'].includes(this.currentUserUid);
  
        if (this.event?.eventVenue) {
          this.loadMap(this.event.eventVenue);
        }
  
        this.changeDetector.detectChanges();
      }, error => {
        console.error('Error fetching event:', error);
      });
    } else {
      console.error('Event ID is null');
    }
  }
  
  private loadMap(address: string) {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ 'address': address }, (results, status) => {
      if (status === 'OK') {
        this.showMap = true;
        const mapOptions = {
          center: results[0].geometry.location,
          zoom: 15,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        const map = new google.maps.Map(document.getElementById('map'), mapOptions);
        new google.maps.Marker({
          map: map,
          position: results[0].geometry.location
        });
      } else {
        this.showMap = false;
        console.error('Geocode was not successful for the following reason: ' + status);
      }
      this.changeDetector.detectChanges();
    });
  }

  getUserName(uid: string) {
    const usersRef = firebase.firestore().collection('accounts');
    usersRef.doc(uid).get().then(doc => {
      if (doc.exists) {
        const userData = doc.data() as Account;
        this.userName = userData.name;
      } else {
        console.error('No such user!');
      }
    }).catch(error => {
      console.error('Error getting user:', error);
    });
  }

  registerForEvent() {
    const eventId = this.event?.id;
    const userId = this.currentUserUid;
    const currentDate = new Date();
    const eventStartDate = new Date(this.event?.eventStartDate);
  
    if (eventId && userId) {
      if (currentDate < eventStartDate) {
        // Check if the month and date are the same (e.g., April 4, May 5, etc.)
        const isSpecialDate = currentDate.getDate() === currentDate.getMonth() + 1;
        const points = isSpecialDate ? 20 : 10; // Double points if it's a special date
  
        this.eventService.registerUserForEvent(eventId, userId)
          .then(() => {
            // Call updateUserPoints with adjusted points
            this.updateUserPoints(userId, points);
  
            this.presentToast(`Successfully registered for the event. You've earned ${points} points!`);
            this.router.navigate(['/events']);
          })
          .catch(error => {
            this.presentToast('Error registering for the event.');
          });
      } else {
        this.presentToast('Registration period has ended.');
      }
    }
  }

  updateUserPoints(userId: string, points: number): void {
    const leaderboardsRef = firebase.firestore().collection('leaderboards');
  
    // Iterate over each leaderboard
    leaderboardsRef.get().then(querySnapshot => {
      querySnapshot.forEach(doc => {
        const leaderboardName = doc.id;
  
        // Check if the user is part of this leaderboard's 'Users' sub-collection
        leaderboardsRef.doc(leaderboardName).collection('Users').doc(userId).get()
          .then(userDoc => {
            if (userDoc.exists) {
              // User is part of this leaderboard, update their points
              leaderboardsRef.doc(leaderboardName).collection('Users').doc(userId)
                .update({
                  points: firebase.firestore.FieldValue.increment(points)
                });
            }
          }).catch(error => {
            console.error(`Error updating user in leaderboard '${leaderboardName}':`, error);
          });
      });
      this.presentToast(`You've earned ${points} points on the leaderboard!`);
    }).catch(error => {
      console.error('Error accessing leaderboards:', error);
    });
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000
    });
    toast.present();
  }

}
