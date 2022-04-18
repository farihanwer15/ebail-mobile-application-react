import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SignDocumentPageRoutingModule } from './sign-document-routing.module';

import { SignDocumentPage } from './sign-document.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SignDocumentPageRoutingModule
  ],
  declarations: [SignDocumentPage]
})
export class SignDocumentPageModule {}
