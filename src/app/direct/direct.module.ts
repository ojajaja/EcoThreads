import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DirectPageRoutingModule } from './direct-routing.module';

import { DirectPage } from './direct.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DirectPageRoutingModule
  ],
  declarations: [DirectPage]
})
export class DirectPageModule {}
