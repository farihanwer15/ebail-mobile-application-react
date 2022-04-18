import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DefendantProfilePage } from './defendant-profile.page';

const routes: Routes = [
  {
    path: '',
    component: DefendantProfilePage
  },
  {
    path: 'defendant-bonds/:defendantId',
    loadChildren: () => import('../defendant-bonds/defendant-bonds.module')
    .then(m => m.DefendantBondsPageModule)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DefendantProfilePageRoutingModule { }
