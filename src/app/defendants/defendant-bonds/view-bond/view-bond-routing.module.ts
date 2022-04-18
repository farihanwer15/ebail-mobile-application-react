import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ViewBondPage } from './view-bond.page';

const routes: Routes = [
  {
    path: '',
    component: ViewBondPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ViewBondPageRoutingModule {}
