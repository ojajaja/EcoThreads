import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { JoinLeaderboardPage } from './join-leaderboard.page';

const routes: Routes = [
  {
    path: '',
    component: JoinLeaderboardPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class JoinLeaderboardPageRoutingModule {}
