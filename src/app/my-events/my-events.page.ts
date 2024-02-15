import { Component, OnInit } from '@angular/core';
import { FirestoreService } from '../shared/services/firestore.service';
import { Events } from '../shared/models/events';
import { AuthService } from '../shared/services/auth.service';

@Component({
  selector: 'app-my-events',
  templateUrl: './my-events.page.html',
  styleUrls: ['./my-events.page.scss'],
})
export class MyEventsPage implements OnInit {
  registeredEvents: Events[] = [];

  constructor(private firestoreService: FirestoreService, private authService: AuthService) {}

  ngOnInit() {
    this.loadMyEvents();
  }

  loadMyEvents() {
    const currentUserId = this.authService.getId();
    if (currentUserId) {
      this.firestoreService.getRegisteredEventsByUserId(currentUserId).subscribe(events => {
        this.registeredEvents = events;
      }, error => {
        console.error('Error fetching events:', error);
      });
    } else {
      console.error('User ID is not available');
    }
  }
}
