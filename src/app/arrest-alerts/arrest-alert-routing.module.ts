import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ArrestAlertsComponent } from './arrest-alerts.component';

const routes: Routes = [
  {
    path: '',
    component: ArrestAlertsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ArrestAlertsComponentRoutingModule {}
