import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ChatComponent } from './chat/chat.component';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';

const routes: Routes = [
  {
    path: '',
    component: ChatComponent // This component needs to handle displaying the chat for a given channelId
  }
];

@NgModule({
  declarations: [ChatComponent],
  imports: [
    CommonModule,
    IonicModule,
    RouterModule.forChild(routes),
    FormsModule,
  ],
  exports: [
    ChatComponent
  ]
})
export class ComponentsModule { }
