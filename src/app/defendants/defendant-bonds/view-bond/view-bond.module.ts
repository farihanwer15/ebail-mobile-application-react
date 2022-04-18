import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ViewBondPageRoutingModule } from './view-bond-routing.module';

import { ViewBondPage } from './view-bond.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ViewBondPageRoutingModule
  ],
  declarations: [ViewBondPage]
})
export class ViewBondPageModule {}
