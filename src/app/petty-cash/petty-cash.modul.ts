import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PettyCashRoutingModule } from './petty-cash-routing.module';

import { PettyCashComponent } from './petty-cash.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PettyCashRoutingModule
  ],
  declarations: [PettyCashComponent]
})
export class PettyCashModule {}
