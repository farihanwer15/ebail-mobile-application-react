import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CourtsPage } from './courts.page';

const routes: Routes = [
  {
    path: '',
    component: CourtsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CourtsPageRoutingModule {}
