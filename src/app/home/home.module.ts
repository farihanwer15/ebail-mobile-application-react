import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { ChartsModule } from 'ng2-charts';
import { HomePage } from './home.page';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ComponentsModule } from '../@components/components.module';
import { PipesModule } from '../pipes/pipes.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule, ReactiveFormsModule,
    IonicModule,
    ChartsModule,
    RouterModule.forChild([
      {
        path: '',
        component: HomePage
      }
    ]),
    ComponentsModule,
    PipesModule
  ],
  declarations: [HomePage],
  entryComponents: []
})
export class HomePageModule { }
