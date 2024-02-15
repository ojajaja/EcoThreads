import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddLeaderboardPageRoutingModule } from './add-leaderboard-routing.module';

import { AddLeaderboardPage } from './add-leaderboard.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddLeaderboardPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [AddLeaderboardPage]
})
export class AddLeaderboardPageModule {}
