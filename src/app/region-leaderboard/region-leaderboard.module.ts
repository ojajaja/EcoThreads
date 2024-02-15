import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RegionLeaderboardPageRoutingModule } from './region-leaderboard-routing.module';

import { RegionLeaderboardPage } from './region-leaderboard.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RegionLeaderboardPageRoutingModule,
  ],
  declarations: [RegionLeaderboardPage]
})
export class RegionLeaderboardPageModule {}
