import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DefendantBondsPage } from './defendant-bonds.page';

const routes: Routes = [
  {
    path: '',
    component: DefendantBondsPage
  },
  {
    path: 'view/:bondId',
    loadChildren: () => import('./view-bond/view-bond.module').then( m => m.ViewBondPageModule)
  },
  {
    path: 'update-bond',
    loadChildren: () => import('./update-bond/update-bond.module').then( m => m.UpdateBondPageModule)
  },
  {
    path: 'upload-bond-contracts',
    loadChildren: () => import('./upload-bond-contracts/upload-bond-contracts.module').then( m => m.UploadBondContractsPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DefendantBondsPageRoutingModule {}
