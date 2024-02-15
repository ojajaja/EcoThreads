import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FirestoreService } from '../shared/services/firestore.service';
import { Events } from '../shared/models/events';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-edit-event',
  templateUrl: './edit-event.page.html',
  styleUrls: ['./edit-event.page.scss'],
})
export class EditEventPage implements OnInit {
  event: Events | undefined;
  editEventForm: FormGroup;
  eventId: string | null;

  constructor(private formBuilder: FormBuilder, private firestoreService: FirestoreService, private activatedRoute: ActivatedRoute, private router: Router, private toastController: ToastController) {
    this.eventId = this.activatedRoute.snapshot.paramMap.get('id');
  }

  ngOnInit() {
    if (this.eventId) {
      this.loadEventDetails();
    }
    this.initForm();
  }

  initForm() {
    this.editEventForm = this.formBuilder.group({
      eventName: ['', Validators.required],
      eventDesc: ['', Validators.required],
      eventStartDate: ['', Validators.required],
      eventEndDate: ['', Validators.required],
      eventVenue: ['', Validators.required]
    });
  }

  loadEventDetails() {
    this.firestoreService.getEventById(this.eventId).subscribe(event => {
      this.editEventForm.patchValue(event);
    });
  }

  updateEvent() {
    if (this.editEventForm.valid && this.eventId) {
      this.firestoreService.updateEvent(this.eventId, this.editEventForm.value)
        .then(() => {
          this.router.navigate(['/event-details', this.eventId]);
        })
        .catch(error => {
        });
    }
  }

  async deleteEvent() {
    if (this.eventId) {
      const confirmation = await this.showConfirmationToast(); // Show confirmation toast
      if (confirmation) {
        this.firestoreService.deleteEvent(this.eventId)
        .then(() => {
          // Event deleted successfully, navigate to a relevant page, e.g., the events list page.
          this.router.navigate(['/events']);
        })
        .catch(error => {
          // Handle error if deletion fails.
          console.error('Error deleting event:', error);
        });
      }
    }
  }

  async showConfirmationToast() {
    const toast = await this.toastController.create({
      message: 'Are you sure you want to delete this event?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            return false; // User canceled
          }
        },
        {
          text: 'Delete',
          handler: () => {
            return true; // User confirmed
          }
        }
      ]
    });

    await toast.present();
    const { role } = await toast.onDidDismiss();
    return role === 'cancel' ? false : true; // Return true if user confirmed, false if canceled
  }

  onFileSelected(event) {
  }

}
