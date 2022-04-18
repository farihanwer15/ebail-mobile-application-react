import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PowersPageRoutingModule } from './powers-routing.module';

import { PowersPage } from './powers.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PowersPageRoutingModule
  ],
  declarations: [PowersPage]
})
export class PowersPageModule {}
