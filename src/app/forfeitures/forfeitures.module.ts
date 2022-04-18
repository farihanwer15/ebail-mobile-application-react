import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ForfeituresPageRoutingModule } from './forfeitures-routing.module';

import { ForfeituresPage } from './forfeitures.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ForfeituresPageRoutingModule
  ],
  declarations: [ForfeituresPage]
})
export class ForfeituresPageModule {}
