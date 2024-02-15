import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { AuthService } from '../shared/services/auth.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.page.html',
  styleUrls: ['./reset-password.page.scss'],
})
export class ResetPasswordPage implements OnInit {

  resetPasswordForm : FormGroup

  constructor(private modalController: ModalController, private router: Router, private authService: AuthService) { 
    this.resetPasswordForm = new FormGroup({
      email: new FormControl('')
  })
  }

  confirmationEmail(){
    this.authService.resetPassword(this.resetPasswordForm.value.email)
  }

  ngOnInit() {
  }

}
