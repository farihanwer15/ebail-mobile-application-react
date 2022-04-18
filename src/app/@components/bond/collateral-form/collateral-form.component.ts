import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { BondsService } from 'src/app/services/bonds.service';
import { ToastController, ModalController, LoadingController } from '@ionic/angular';
import { CollateralsService } from 'src/app/services/collaterals.service';

import * as _ from 'lodash';
import { BondCollateralsService } from 'src/app/services/bond-collaterals.service';

@Component({
  selector: 'app-collateral-form',
  templateUrl: './collateral-form.component.html',
  styleUrls: ['./collateral-form.component.scss'],
})
export class CollateralFormComponent implements OnInit {

  
  @ViewChild('collateralForm', { static: false }) collateralForm: NgForm;
  @Input() bondId;
  @Input() collateralData;
  @Input() bondIndemnitors = [];

  spinner: Boolean = false;
  errors = [];

  collateral: any = {
    type: undefined,
    amount: undefined,
    owners: [],
    receivedDate: undefined,
    seizedDate: undefined,
    returnedDate: undefined,
    receiptNumber: undefined,
    releaseCondition: undefined,
    promissoryCollected: 'false',
    heldBy: undefined,
    description: undefined
  }

  selectedOwner = undefined;
  bond: any = {
    indemnitors: []
  };

  constructor(
    private collateralsService: BondCollateralsService,
    private bondsService: BondsService,
    private toastController: ToastController,
    private modalController: ModalController,
    private loadingController: LoadingController
  ) { }

  ngOnInit() {
    
    this.collateral.receiptNumber = Math.floor(100000000 + Math.random() * 900000000);

    if (this.collateralData) {
      this.collateral = this.collateralData;
      this.collateral.receivedDate = this.collateral.receivedDate;
      this.collateral.seizedDate = this.collateral.seizedDate;
      this.collateral.returnedDate = this.collateral.returnedDate;
    }

    console.log('this.bondIndemnitors', this.bondIndemnitors);
    
  }

  async closeModal(){
    await this.modalController.dismiss();
  }

  addOwner(){

    const indemExists = _.find(this.collateral.owners, (o) => {
      return o._id === this.selectedOwner;
    });

    if(!indemExists){      
      let indem = _.find(this.bondIndemnitors, (i) => {
        return i._id === this.selectedOwner;
      });
      this.collateral.owners.push(indem);
    }
    this.selectedOwner = undefined;
  }

  removeOwner(owner) {
    _.remove(this.collateral.owners, (o) => {
      return o._id === owner._id;
    });
  }

  async validate() {
    this.errors = [];

    if (this.collateralForm.invalid) {
      Object.keys(this.collateralForm.controls).forEach(key => {
        this.collateralForm.controls[key].markAsTouched();
      });
      this.errors.push('Please fill all required fields.');
    }

    
    if(this.errors.length > 0){

      const toast = await this.toastController.create({
        color: 'danger',
        duration: 3000,
        message: 'Please fill all required fields.',
        showCloseButton: true,
        position: 'top'
      });

      await toast.present();

      return false;
    }

    return true;
  }

  async onSubmit() {
    if (!await this.validate()) {
      return;
    }

    let collateralData = {
      type: this.collateral.type,
      owners: this.collateral.owners.length > 0 ? this.collateral.owners : undefined,
      amount: this.collateral.amount,
      receiptNumber: this.collateral.receiptNumber,
      receivedDate: this.collateral.receivedDate,
      seizedDate: this.collateral.seizedDate,
      returnedDate: this.collateral.returnedDate,
      heldBy: this.collateral.heldBy,
      description: this.collateral.description,
      promissoryCollected: this.collateral.promissoryCollected === 'true',
      releaseCondition: this.collateral.releaseCondition,
    };

    if (this.collateral._id) {
      this.updateCollateral(collateralData)
    }
    else{
      this.addCollateral(collateralData);
    }
  }

  async addCollateral(data){

    const loading = await this.loadingController.create();
    await loading.present();

    this.collateralsService
    .addCollateral(this.bondId, data)
    .subscribe(
      async collateral => {
        
        this.collateralsService.collateralAdded(collateral.insertedId);

        const toast = await this.toastController.create({
          color: 'success',
          duration: 3000,
          message: 'Collateral has been added successfully.',
          showCloseButton: true,
          position: 'top'
        });

        this.bondsService.bondUpdated();
  
        await toast.present();
        await loading.dismiss();
        this.closeModal();
      },
      async error => {
        await loading.dismiss();
      }
    )
  }

  async updateCollateral(data){
    const loading = await this.loadingController.create();
    await loading.present();

    this.collateralsService
    .updateCollateral(this.bondId, this.collateral._id, data)
    .subscribe(
      async collateral => {
        this.spinner = false;
        
        this.collateralsService.collateralAdded(null);

        this.bondsService.bondUpdated();
        const toast = await this.toastController.create({
          color: 'success',
          duration: 3000,
          message: 'Collateral has been updated successfully.',
          showCloseButton: true,
          position: 'top'
        });
        
        await toast.present();
        await loading.dismiss();
        this.closeModal();

      },
      async error => {
        await loading.dismiss();
      }
    )
  }
  
}
