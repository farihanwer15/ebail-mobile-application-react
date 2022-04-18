import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BondsPageRoutingModule } from './bonds-routing.module';

import { BondsPage } from './bonds.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BondsPageRoutingModule
  ],
  declarations: [BondsPage]
})
export class BondsPageModule {}
