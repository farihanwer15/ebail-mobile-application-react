import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CheckInsPageComponentRoutingModule } from './checkins-routing.module';

import { CheckInsPageComponent } from './check-ins-page.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CheckInsPageComponentRoutingModule
  ],
  declarations: [CheckInsPageComponent]
})
export class CheckInsPageComponentModule {}
