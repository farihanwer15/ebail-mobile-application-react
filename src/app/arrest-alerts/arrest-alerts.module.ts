import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ArrestAlertsComponentRoutingModule } from './arrest-alert-routing.module';

import { ArrestAlertsComponent } from './arrest-alerts.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ArrestAlertsComponentRoutingModule
  ],
  declarations: [ArrestAlertsComponent]
})
export class ArrestAlertsComponentModule {}
