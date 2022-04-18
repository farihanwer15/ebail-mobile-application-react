import { Component, OnInit, Input,SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController,ToastController } from '@ionic/angular';
import { BondContractsService } from 'src/app/services/bond-contracts.service';
import { SuretyService } from 'src/app/services/surety.service';
import { PaymentPlanService } from 'src/app/services/payment-plan.service';
import { UserStore } from 'src/app/@store/user.store';

import * as _ from 'lodash';
@Component({
  selector: 'app-bond-review',
  templateUrl: './bond-review.component.html',
  styleUrls: ['./bond-review.component.scss'],
})
export class BondReviewComponent implements OnInit {

  @Input() bond;
  @Input() bondId;
  @Input() defendantId;
  @Input() bonds;

  sendEmail = true;
  sendSMS = false;

  
  contractTemplateId;
  surety = undefined;

  constructor(
    private router: Router,
    private loadingController: LoadingController,
    private bondContractsService: BondContractsService,
    private suretyService: SuretyService,
    private paymentPlanService: PaymentPlanService,
    private toastController: ToastController,
    private userStore: UserStore,

  ) { }

  ngOnInit() {
    // this.initBond();
  }

  initBond(){
    if (this.bond && this.bond.power && this.bond.power.surety.contractTemplates 
      && this.bond.power.surety.contractTemplates.length > 0) {
      this.contractTemplateId = this.bond.power.surety.contractTemplates[0].templateId;
    }
    this.getSurety();
  }

  getSurety(){
    if ((this.bond.power && this.bond.power.surety) 
    || (this.bond.type === 'cash' && this.bond.cashSurety)
    || (this.bond.powerPending && this.bond.tempSurety) || this.bond.surety) {

      let suretyId = undefined;
      
      if(this.bond.surety){
        suretyId = this.bond.surety._id;
      }

      if(this.bond.power && this.bond.power.surety){
        suretyId = this.bond.power.surety._id;
      }
      
      if (this.bond.type === 'cash' && this.bond.cashSurety) {
        suretyId = this.bond.cashSurety._id
      }

      if (this.bond.powerPending && this.bond.tempSurety) {
        suretyId = this.bond.tempSurety._id
      }

      if (this.userStore.getUser().agency.parentAgencyId && this.bond.power.subAgencySurety) {
        suretyId = this.bond.power.subAgencySurety._id;
      }

      

      this.suretyService.getSurety(suretyId)
      .subscribe(
        surety => {
          this.surety = surety;
          
          if (surety.contractTemplates && surety.contractTemplates.length > 0) {
            this.contractTemplateId = surety.contractTemplates[0].templateId;
            if (this.bonds) {
              this.bonds.forEach((bond, index) => {
                bond.contractTemplateId = surety.contractTemplates[0].templateId;
                bond.contractArrangement = surety.contractTemplates[0].contractArrangement;
                bond.totalIndemsPerContract = surety.contractTemplates[0].totalIndemsPerContract
                if (index > 0 && surety.contractTemplates.length > 1) {
                  bond.contractTemplateId = surety.contractTemplates[1].templateId;
                  bond.contractArrangement = surety.contractTemplates[1].contractArrangement;
                  bond.totalIndemsPerContract = surety.contractTemplates[1].totalIndemsPerContract
                }
              });
            }
          }

          
        }
      )
    }
  }

 async saveBond(){
  const loading = await this.loadingController.create();
  await loading.present();

    let bondIds = []
    this.bonds.forEach(bond => {
      bondIds.push(bond._id)
    });
    
    this.paymentPlanService.generateInvoices({
      bondIds: bondIds
    }).subscribe(async res=>{
      const toast = await this.toastController.create({
        message: 'Bond has been saved successfully.',
        color: 'success',
        duration: 3000,
        position: 'top'
      });
      await loading.dismiss();
      await toast.present();
  
      this.router.navigate(['defendants/defendant-bonds', this.defendantId]);
    },
    async errors => {
      await loading.dismiss();
      console.log(errors);
    }
    )
   
  }

  
  async sendContract(){
    let bonds = [];
    let bondIds = []
    this.bonds.forEach(bond => {

      bondIds.push(bond._id)
    const template = _.find(this.surety.contractTemplates, temp=> {
      return temp.templateId === this.contractTemplateId;
    })

     bonds.push({
      id: this.bondId,
      contractTemplateId: this.contractTemplateId,
      contractArrangement: template ? template.contractArrangement : undefined,
      totalIndemsPerContract: template ? template.totalIndemsPerContract : undefined,
      sendEmail: this.sendEmail,
      sendSMS: this.sendSMS
    });
  });
    // this.bonds.forEach(bond => {
    //   bonds.push({
    //     id: this.bondId,
    //     contractTemplateId: this.contractTemplateId
    //   });
    // });
    
    // return;
    this.paymentPlanService.generateInvoices({
      bondIds: bondIds
    }).subscribe()

    const loading = await this.loadingController.create();
    await loading.present();
    
    this.bondContractsService
    .sendContract({
      defendantId: this.defendantId,
      bonds: bonds
    })
    .subscribe(
      async contracts => {
        const toast = await this.toastController.create({
          message: 'Contract has been sent successfully.',
          color: 'success',
          duration: 3000,
          position: 'top'
        });
        await toast.present();
        await loading.dismiss();
        this.bondContractsService.contractSent();
        this.router.navigate(['defendants/defendant-bonds', this.defendantId]);
      },
      async errors => {
        await loading.dismiss();
        console.log(errors);
      }
    )
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.bond) {
      this.initBond();
    }
  }

}
