import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DefendantsPageRoutingModule } from './defendants-routing.module';
import { RouterModule } from '@angular/router';
import { DefendantsPage } from './defendants.page';
//import { DefendantProfilePage } from './defendant-profile/defendant-profile.page'
import { DefendantProfilePageModule } from './defendant-profile/defendant-profile.module';
import { DefendantBondsPageModule } from './defendant-bonds/defendant-bonds.module';
import { ComponentsModule } from '../@components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DefendantsPageRoutingModule,
    DefendantBondsPageModule,
    ComponentsModule,
    RouterModule.forChild([
      { path: 'defendant-profile', component: DefendantProfilePageModule },
      { path: 'defendant-bond', component: DefendantBondsPageModule }
    ])
  ],
  declarations: [DefendantsPage]
})
export class DefendantsPageModule { }
