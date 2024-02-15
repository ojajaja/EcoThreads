import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RegionLeaderboardPage } from './region-leaderboard.page';

const routes: Routes = [
  {
    path: '',
    component: RegionLeaderboardPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RegionLeaderboardPageRoutingModule {}
