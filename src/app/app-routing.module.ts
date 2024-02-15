import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { ChatComponent } from './shared/components/chat/chat.component';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule)
  },
  {
    path: 'leaderboard',
    loadChildren: () => import('./leaderboard/leaderboard.module').then( m => m.LeaderboardPageModule)
  },
  {
    path: 'chat',
    loadChildren: () => import('./chat/chat.module').then( m => m.ChatPageModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'direct/:id',
    loadChildren: () => import('./direct/direct.module').then( m => m.DirectPageModule)
  },
  {
    path: 'reset-password',
    loadChildren: () => import('./reset-password/reset-password.module').then( m => m.ResetPasswordPageModule)
  },
  {
    path: 'register',
    loadChildren: () => import('./register/register.module').then( m => m.RegisterPageModule)
  },
  {
    path: 'discussions/:discussionId',
    component: ChatComponent
  },
  {
    path: 'events',
    loadChildren: () => import('./events/events.module').then( m => m.EventsPageModule)
  },
  {
    path: 'add-event',
    loadChildren: () => import('./add-event/add-event.module').then( m => m.AddEventPageModule)
  },
  {
    path: 'edit-event/:id',
    loadChildren: () => import('./edit-event/edit-event.module').then( m => m.EditEventPageModule)
  },
  {
    path: 'event-details/:id',
    loadChildren: () => import('./event-details/event-details.module').then( m => m.EventDetailsPageModule)
  },
  {
    path: 'my-events',
    loadChildren: () => import('./my-events/my-events.module').then( m => m.MyEventsPageModule)
  },
  {
    path: 'leaderboard-details/:id',
    loadChildren: () => import('./leaderboard-details/leaderboard-details.module').then( m => m.LeaderboardDetailsPageModule)
  },
  {
    path: 'add-leaderboard',
    loadChildren: () => import('./add-leaderboard/add-leaderboard.module').then( m => m.AddLeaderboardPageModule)
  },
  {
    path: 'join-leaderboard',
    loadChildren: () => import('./join-leaderboard/join-leaderboard.module').then( m => m.JoinLeaderboardPageModule)
  },
  {
    path: 'region-leaderboard',
    loadChildren: () => import('./region-leaderboard/region-leaderboard.module').then( m => m.RegionLeaderboardPageModule)
  },

];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
