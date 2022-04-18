import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CourtsPageRoutingModule } from './courts-routing.module';

import { CourtsPage } from './courts.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CourtsPageRoutingModule
  ],
  declarations: [CourtsPage]
})
export class CourtsPageModule {}
