import { Component } from '@angular/core';
import { AuthService } from '../shared/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-Account',
  templateUrl: 'Account.page.html',
  styleUrls: ['Account.page.scss']
})
export class AccountPage {

  constructor(private authService: AuthService, private router: Router) {}

  logout() {
    this.authService.logout();
    this.router.navigateByUrl('login')
    }

}
