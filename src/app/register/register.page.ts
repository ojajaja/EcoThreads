import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { AuthService } from '../shared/services/auth.service';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {
  signupError: string = '';
  registerForm: FormGroup;
  errorPresent: boolean = false;

  constructor(
    private authService: AuthService,
    private modalController: ModalController,
    private router: Router
  ) {
    this.registerForm = new FormGroup({
      username: new FormControl(''),
      email: new FormControl(''),
      password: new FormControl(''),
      confirmPassword: new FormControl(''),
      referralCode: new FormControl(''),
    });
  }

  login() {
    this.router.navigateByUrl('login');
  }

  // Inside your register() function
  register() {
    if (!this.registerForm.value.username) {
      this.signupError = 'Username cannot be empty.';
      this.errorPresent = true;
      return;
    }

    if (!this.passwordsMatch()) {
      this.signupError = 'Passwords do not match.';
      this.errorPresent = true;
      return;
    }

    // Call the register method from authService
    this.authService
      .register(this.registerForm.value.email, this.registerForm.value.password)
      .catch((error) => {
        // Handle any errors from either registration or account creation
        console.error('Error during registration or account creation:', error);
        this.signupError =
          error.message || 'An error occurred during the process.';
        this.errorPresent = true;
      });
  }

  private passwordsMatch(): boolean {
    const password = this.registerForm.value.password;
    const confirmPassword = this.registerForm.value.confirmPassword;
    return password === confirmPassword;
  }

  ngOnInit() {}
}
