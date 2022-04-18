import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BondFormPageRoutingModule } from './bond-form-routing.module';

import { BondFormPage } from './bond-form.page';
import { ComponentsModule } from '../@components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BondFormPageRoutingModule,
    ComponentsModule
  ],
  declarations: [BondFormPage]
})
export class BondFormPageModule {}
