import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SignDocumentPage } from './sign-document.page';

const routes: Routes = [
  {
    path: '',
    component: SignDocumentPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SignDocumentPageRoutingModule {}
