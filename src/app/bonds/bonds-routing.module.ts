import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BondsPage } from './bonds.page';

const routes: Routes = [
  {
    path: '',
    component: BondsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BondsPageRoutingModule {}
