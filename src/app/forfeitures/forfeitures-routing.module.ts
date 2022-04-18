import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ForfeituresPage } from './forfeitures.page';

const routes: Routes = [
  {
    path: '',
    component: ForfeituresPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ForfeituresPageRoutingModule {}
