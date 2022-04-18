import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PowersPage } from './powers.page';

const routes: Routes = [
  {
    path: '',
    component: PowersPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PowersPageRoutingModule {}
