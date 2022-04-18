import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then(m => m.HomePageModule)
  },
  {
    path: 'list',
    loadChildren: () => import('./list/list.module').then(m => m.ListPageModule)
  },
  {
    path: 'defendants',
    loadChildren: () => import('./defendants/defendants.module').then(m => m.DefendantsPageModule)
  },
  {
    path: 'arrest-alerts',
    loadChildren: () => import('./arrest-alerts/arrest-alerts.module').then(m => m.ArrestAlertsComponentModule)
  },
  {
    path: 'powers',
    loadChildren: () => import('./powers/powers.module').then(m => m.PowersPageModule)
  },
  {
    path: 'checkins',
    loadChildren: () => import('./check-ins-page/checkins.module').then(m => m.CheckInsPageComponentModule)
  },
  {
    path: 'bonds',
    loadChildren: () => import('./bonds/bonds.module').then(m => m.BondsPageModule)
  },
  {
    path: 'tasks',
    loadChildren: () => import('./tasks/tasks.module').then(m => m.TasksPageModule)
  },
  {
    path: 'courts',
    loadChildren: () => import('./courts/courts.module').then( m => m.CourtsPageModule)
  },
  {
    path: 'petty-cash',
    loadChildren: () => import('./petty-cash/petty-cash.modul').then( m => m.PettyCashModule)
  },
  {
    path: 'forfeitures',
    loadChildren: () => import('./forfeitures/forfeitures.module').then( m => m.ForfeituresPageModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'sign-document/:contractId/:partyIndex',
    loadChildren: () => import('./sign-document/sign-document.module').then( m => m.SignDocumentPageModule)
  },
  {
    path: 'bond-form/:defendantId',
    loadChildren: () => import('./bond-form/bond-form.module').then( m => m.BondFormPageModule)
  },
  {
    path: 'bond-form/:defendantId/:bondId',
    loadChildren: () => import('./bond-form/bond-form.module').then( m => m.BondFormPageModule)
  },
  {
    path: 'cases',
    loadChildren: () => import('./cases/cases.module').then( m => m.CasesPageModule)
  },
  {
    path: 'logs',
    loadChildren: () => import('./logs/logs.module').then( m => m.LogsPageModule)
  },
  {
    path: 'payments',
    loadChildren: () => import('./payments/payments.module').then( m => m.PaymentsPageModule)
  },
  {
    path: 'setting',
    loadChildren: () => import('./setting/setting.module').then( m => m.SettingPageModule)
  }


];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
