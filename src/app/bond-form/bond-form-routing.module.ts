import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BondFormPage } from './bond-form.page';

const routes: Routes = [
  {
    path: '',
    component: BondFormPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BondFormPageRoutingModule {}
