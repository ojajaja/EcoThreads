import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LeaderboardDetailsPageRoutingModule } from './leaderboard-details-routing.module';

import { LeaderboardDetailsPage } from './leaderboard-details.page';
import { NgChartsModule } from 'ng2-charts';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LeaderboardDetailsPageRoutingModule,
    NgChartsModule
  ],
  declarations: [LeaderboardDetailsPage]
})
export class LeaderboardDetailsPageModule {}
