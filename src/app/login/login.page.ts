import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { AuthService } from '../shared/services/auth.service';
import { ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { ResetPasswordPage } from '../reset-password/reset-password.page';
import { ChatService } from '../shared/services/chat.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  loginForm: FormGroup;
  loginError: string = '';
  errorPresent: boolean = false;
  isUser = false;
  isAdmin = false;

  constructor(
    private authService: AuthService,
    private modalController: ModalController,
    private router: Router,
    private chatService: ChatService
  ) {
    this.loginForm = new FormGroup({
      email: new FormControl(''),
      password: new FormControl(''),
    });
  }

  login() {
    this.authService
      .login(this.loginForm.value.email, this.loginForm.value.password)
      .then((userCredential) => {
        // Set current user ID in chat service
        this.chatService.setCurrentUserId(userCredential.user.uid);
  
        // Based on user role go to different page
        if (this.loginForm.value.email == 'ecothreads@nyp.sg') {
          this.router.navigate(['/tabs/tab1']);
        } else {
          this.router.navigate(['/tabs/tab1']);
        }
      })
      .catch((error) => {
        this.loginError = 'Username or password is wrong';
        this.errorPresent = true;
    });
  }
  

  register() {
    this.router.navigateByUrl('register');
  }

  async forgotPassword() {
    const modal = await this.modalController.create({
      component: ResetPasswordPage,
      cssClass: 'modal-content',
    });
    return await modal.present();
  }

  ngOnInit() {}
}
