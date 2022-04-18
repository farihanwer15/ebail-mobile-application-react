import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { UpdateBondPage } from './update-bond.page';

const routes: Routes = [
  {
    path: '',
    component: UpdateBondPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UpdateBondPageRoutingModule {}
