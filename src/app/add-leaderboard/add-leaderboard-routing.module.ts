import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddLeaderboardPage } from './add-leaderboard.page';

const routes: Routes = [
  {
    path: '',
    component: AddLeaderboardPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddLeaderboardPageRoutingModule {}
