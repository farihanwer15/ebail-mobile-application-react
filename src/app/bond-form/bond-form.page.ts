import { Component, OnInit, OnDestroy,RendererFactory2, Inject,Renderer2 } from "@angular/core";
import { ActivatedRoute } from '@angular/router';
import { ModalController, ToastController, ActionSheetController } from '@ionic/angular';
import { CourtDateFormComponent } from '../@components/bond/court-date-form/court-date-form.component';
import { CollateralFormComponent } from '../@components/bond/collateral-form/collateral-form.component';
import { DefendantsService } from '../services/defendants.service';
import { AddBondIndemnitorFormComponent } from './../@components/bond/add-bond-indemnitor-form/add-bond-indemnitor-form.component';
import {ContractFormComponent} from './../@components/bond/contract-form/contract-form.component'
import * as _ from 'lodash';
import { BondsService } from '../services/bonds.service';
import { Subscription } from 'rxjs';
import { UserStore } from '../@store/user.store';
import { DOCUMENT } from '@angular/common';
import { AppService } from './../services/app.service';

@Component({
  selector: 'app-bond-form',
  templateUrl: './bond-form.page.html',
  styleUrls: ['./bond-form.page.scss'],
})
export class BondFormPage implements OnInit, OnDestroy {

  defendantId;
  bondId;
  indemnitorId = undefined;
  relation = undefined;
  step = 1;

  totalIndemnitors = 0;

  courtDates = [];
  bondIndemnitors = [];
  defendantIndemnitors = [];
  collaterals = [];
  bonds = [];
  bond: any = {
    type: 'standard',
    number: undefined,
    date: undefined,
    bondAmount: undefined,
    premiumAmount: undefined,
    initialAmount: undefined,
    filingFee: undefined,
    stateTaxFee: undefined,
    state: undefined,
    county: undefined,
    charges: [],
    caseNumber: undefined,
    applicationNumber: undefined,
    nycidNumber: undefined,
    indictmentNumber: undefined,
    docketNumber: undefined,
    bookingNumber: undefined,
    referralAgent: undefined,
    powerPending: false,
    referralFee: undefined,
    referralFeeType: 'currency',
    setDefAsSecondIndemnitor: false,
  };

  darkMode = true;
  renderer: Renderer2;

  private bondUpdatedSubscription: Subscription;

  constructor(
    private route: ActivatedRoute,
    private modalController: ModalController,
    private toastController: ToastController,
    private defService: DefendantsService,
    private bondsService: BondsService,
    public actionSheetController: ActionSheetController,
    public userStore: UserStore,
    private appService: AppService,
    private rendererFactory : RendererFactory2,
    @Inject(DOCUMENT)
    private document:Document
  ) {
    this.renderer = this.rendererFactory.createRenderer(null, null)

   }

  ngOnInit() {
    this.defendantId = this.route.snapshot.paramMap.get('defendantId');

    this.appService.getDarkMode().subscribe(res => {
      if (res) {
        
        this.renderer.addClass(this.document.body, 'dark-theme')
        this.darkMode = true;

      } else {
        this.renderer.removeClass(this.document.body, 'dark-theme')
        this.darkMode = false;

      }
    })
    // if(this.userStore.getUser().darkMode){
    //  this.darkMode = true
    // }else{
    //   this.darkMode = false
    // }

    this.initEvents();

    this.defendantId = this.route.snapshot.paramMap.get('defendantId');
    this.bondId = this.route.snapshot.paramMap.get('bondId');
    
    if (this.bondId && this.defendantId) {
      this.getDefendant();
    }
  }

  initEvents(){
    this.bondUpdatedSubscription = this.bondsService
    .bondUpdated$
    .subscribe(
      () => {
        this.getDefendant();
      }
    )
  }
  
  getDefendant(){
    if(this.defendantId){
      this.defService
      .getDefendant(this.defendantId)
      .subscribe(
        def => {

          if (def.indemnitors) {
            this.defendantIndemnitors = def.indemnitors;
          }
          
          if (def.bonds && this.bondId) {
            const bond = _.find(def.bonds, bond => {
              return bond._id === this.bondId;
            });
          
            if (bond) {

              
              this.bond = bond;
              this.courtDates = bond.courtDates ? bond.courtDates : [];

              if (bond.indemnitors) {
                this.bondIndemnitors = bond.indemnitors;
              }
              if (bond.collaterals) {
                this.collaterals = bond.collaterals;
              }
              const index = _.findIndex(this.bonds, b => {
                return b._id === this.bondId;
              });

              if (index >= 0) {
                this.bonds.splice(index, 1, this.bond);
              }
              else{
                this.bonds = [Object.assign({}, bond)];
              }
            }
          }
          
        }
      )
    }
  }


  onBondInfoSaved(event){
    if(event !== 'updated'){
      this.bondId = event;
      this.step = 2
    }
  }

  onInvoicesCreated(){
    this.step = 5;
  }

  goToPreviousStep(){
    if(this.step > 1){
      this.step--;
    }
  }

  switchStep(step){
    this.step = step;
  }

  async goToNextStep(){

    // if(this.step === 3){
      
    //   if(this.bondIndemnitors.length < 1){
    //     const toast = await this.toastController.create({
    //       color: 'danger',
    //       duration: 3000,
    //       message: 'Please add atleast 1 indemnitor to proceed.',
    //       showCloseButton: true,
    //       position: 'top'
    //     });

    //     await toast.present();
    //     return;
    //   }
    // }

    if(this.step < 5){
      this.step++;
    }
  }

  async openCourtDateFormModal(){
    const modal = this.modalController.create({
      component: CourtDateFormComponent,
      componentProps: {
        bondId: this.bondId
      }
    });

    (await modal).present();
    
  }

  async openCollateralFormModal(){

    // if(this.bondIndemnitors.length < 1){
    //   const toast = await this.toastController.create({
    //     color: 'danger',
    //     duration: 3000,
    //     message: 'Atleast 1 indemnitor is required to add collateral.',
    //     showCloseButton: true,
    //     position: 'top'
    //   });

    //   await toast.present();
    //   return;
    // }

    const modal = this.modalController.create({
      component: CollateralFormComponent,
      componentProps: {
        bondId: this.bondId,
        bondIndemnitors: this.defendantIndemnitors
      }
    });

    (await modal).present();

  }

  async openContractFormModal(){

    const modal = this.modalController.create({
      component:ContractFormComponent,
      componentProps: {
        bondId: this.bondId,
        defendantId:this.defendantId,
      }
    });

    (await modal).present();

  }
  async openIndemnitorsFormModal(){

    const modal = this.modalController.create({
      component: AddBondIndemnitorFormComponent,
      componentProps: {
        bondId: this.bondId,
        defendantId:this.defendantId, 
        indemnitorId : this.indemnitorId,
        relation : this.relation
      }
    });

    (await modal).present();

  }

  onIndemnitorUpdated(count){
    
    this.totalIndemnitors = count;
  }

  bondAdded(bond){
    if(this.bonds.length === 0){
      this.bonds.push(bond);
    }
    else if(this.bonds.length > 0){
      this.bonds[this.bonds.length - 1] = bond;
    }
  }

  ngOnDestroy(){
    this.bondUpdatedSubscription.unsubscribe();
  }

}
