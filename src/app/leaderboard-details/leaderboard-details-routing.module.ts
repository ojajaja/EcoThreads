import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LeaderboardDetailsPage } from './leaderboard-details.page';

const routes: Routes = [
  {
    path: '',
    component: LeaderboardDetailsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LeaderboardDetailsPageRoutingModule {}
