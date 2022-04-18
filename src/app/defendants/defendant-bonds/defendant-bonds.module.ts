import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DefendantBondsPageRoutingModule } from './defendant-bonds-routing.module';

import { DefendantBondsPage } from './defendant-bonds.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DefendantBondsPageRoutingModule
  ],
  declarations: [DefendantBondsPage]
})
export class DefendantBondsPageModule {}
