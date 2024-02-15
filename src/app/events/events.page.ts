import { Component, OnInit, ViewChild } from '@angular/core';
import { FirestoreService } from '../shared/services/firestore.service';
import { Events } from '../shared/models/events';
import { IonSearchbar } from '@ionic/angular';

@Component({
  selector: 'app-events',
  templateUrl: './events.page.html',
  styleUrls: ['./events.page.scss'],
})
export class EventsPage implements OnInit {
  @ViewChild('searchBar', { static: false }) searchBar: IonSearchbar;
  events: Events[] = [];
  filteredEvents: Events[];

  constructor(private firestoreService: FirestoreService) {
    this.firestoreService.getEvents()
    .subscribe(data => {
      this.events = data.sort((a, b) => {
        return b.eventEndDate.localeCompare(a.eventEndDate);
      });
      this.filteredEvents = [...this.events];
    });
  }

  ngOnInit() {
  }

  search(event: any) {
    const searchText = event.target.value.toLowerCase();
  
    if (!searchText.trim()) {
      this.filteredEvents = [...this.events];
      return;
    }
  
    this.filteredEvents = this.events.filter((item) => {
      return item.eventName.toLowerCase().includes(searchText);
    });
  }
  

}
