import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { UploadBondContractsPage } from './upload-bond-contracts.page';

const routes: Routes = [
  {
    path: '',
    component: UploadBondContractsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UploadBondContractsPageRoutingModule {}
