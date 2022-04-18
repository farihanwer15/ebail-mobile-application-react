import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { UpdateBondPageRoutingModule } from './update-bond-routing.module';

import { UpdateBondPage } from './update-bond.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    UpdateBondPageRoutingModule
  ],
  declarations: [UpdateBondPage]
})
export class UpdateBondPageModule {}
