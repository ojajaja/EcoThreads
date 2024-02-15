import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { JoinLeaderboardPageRoutingModule } from './join-leaderboard-routing.module';

import { JoinLeaderboardPage } from './join-leaderboard.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    JoinLeaderboardPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [JoinLeaderboardPage]
})
export class JoinLeaderboardPageModule {}
