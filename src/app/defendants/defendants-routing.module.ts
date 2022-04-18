import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DefendantsPage } from './defendants.page';


const routes: Routes = [
  {
    path: '',
    component: DefendantsPage
  },
  {
    path: 'defendant-profile/:defendantId',
    loadChildren: () => import('./defendant-profile/defendant-profile.module').then(m => m.DefendantProfilePageModule)
  },
  {
    path: 'defendant-bonds/:defendantId',
    loadChildren: () => import('./defendant-bonds/defendant-bonds.module').then( m => m.DefendantBondsPageModule)
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DefendantsPageRoutingModule { }
