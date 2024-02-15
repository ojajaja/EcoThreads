import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/storage';
import { FirestoreService } from '../shared/services/firestore.service';
import { Events } from '../shared/models/events';

@Component({
  selector: 'app-add-event',
  templateUrl: './add-event.page.html',
  styleUrls: ['./add-event.page.scss'],
})
export class AddEventPage implements OnInit {
  addEventForm: FormGroup;
  selectedFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private firestoreService: FirestoreService,
    private router: Router
  ) {
    this.addEventForm = this.fb.group({
      eventName: ['', Validators.required],
      eventDesc: ['', Validators.required],
      eventStartDate: ['', Validators.required],
      eventEndDate: ['', Validators.required],
      eventVenue: ['', Validators.required],
      eventBanner: ['']
    });
  }

  ngOnInit() {
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
    } else {
      this.selectedFile = null;
    }
  }

  addEvent() {
    if (this.addEventForm.valid) {
      const formData: Events = this.addEventForm.value;
      this.submitEventData(formData).then(() => {
        this.router.navigate(['/events']);
      }).catch(error => {
        console.error('Error adding event:', error);
      });
    } else {
      console.error('Form is not valid');
    }
  }
  
  async submitEventData(eventData: Events) {
    if (this.selectedFile) {
      await this.firestoreService.addEventWithImage(eventData, this.selectedFile);
    } else {
      await this.firestoreService.addEvent(eventData);
    }
  }
  
  
}
