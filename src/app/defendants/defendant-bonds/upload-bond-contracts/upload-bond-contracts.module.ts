import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { UploadBondContractsPageRoutingModule } from './upload-bond-contracts-routing.module';

import { UploadBondContractsPage } from './upload-bond-contracts.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    UploadBondContractsPageRoutingModule
  ],
  declarations: [UploadBondContractsPage]
})
export class UploadBondContractsPageModule {}
