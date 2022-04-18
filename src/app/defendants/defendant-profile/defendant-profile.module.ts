import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { DefendantProfilePageRoutingModule } from './defendant-profile-routing.module';
import { DefendantBondsPageModule } from '../defendant-bonds/defendant-bonds.module';
import { DefendantProfilePage } from './defendant-profile.page';
import { ComponentsModule } from 'src/app/@components/components.module';
import { DefendantProfileComponent } from 'src/app/@components/defendant/defendant-profile/defendant-profile.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DefendantProfilePageRoutingModule,
    DefendantBondsPageModule,
    ComponentsModule,
    RouterModule.forChild([
      { path: 'defendant-bonds', component: DefendantBondsPageModule }
    ])
  ],
  declarations: [
    DefendantProfilePage,
  ]
})
export class DefendantProfilePageModule { }
