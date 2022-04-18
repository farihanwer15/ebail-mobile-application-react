import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CheckInsPageComponent } from './check-ins-page.component';

const routes: Routes = [
  {
    path: '',
    component: CheckInsPageComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CheckInsPageComponentRoutingModule {}
