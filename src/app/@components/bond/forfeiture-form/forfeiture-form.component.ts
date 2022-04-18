import { Component, OnInit, Input, ViewChild, SimpleChanges, OnChanges } from '@angular/core';
import { LoadingController, ToastController, ModalController } from '@ionic/angular';
import { BondsService } from 'src/app/services/bonds.service';

import * as moment from 'moment';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-forfeiture-form',
  templateUrl: './forfeiture-form.component.html',
  styleUrls: ['./forfeiture-form.component.scss'],
})
export class ForfeitureFormComponent implements OnInit, OnChanges {

  @ViewChild('fortForm', { static: false }) forfeitureForm: NgForm;
  
  @Input() bondId;
  @Input() bond: any = {};

  @Input() defendantId;
  
  forfeiture = {
    status: undefined,
    mailingDate: undefined,
    forfeitureDate: undefined,
    satisfyDate: undefined
  }
  errors = [];

  constructor(
    private loadingController: LoadingController,
    private toastController: ToastController,
    private bondsService: BondsService,
    private modalController: ModalController
  ) { }

  ngOnInit() {
    this.initForfeiture();
  }

  initForfeiture(){
    if(this.bond && this.bond.forfeiture){
      this.forfeiture.forfeitureDate = this.bond.forfeiture.date;
      this.forfeiture.satisfyDate = this.bond.forfeiture.satisfyDate;
      this.forfeiture.mailingDate = this.bond.forfeiture.mailingDate ? this.bond.forfeiture.mailingDate : undefined;
      this.forfeiture.status = this.bond.forfeiture.status;
    }
    else{
      this.forfeiture = {
        status: undefined,
        mailingDate: undefined,
        forfeitureDate: undefined,
        satisfyDate: undefined
      }
    }
  }

  async validate(){
    this.errors = [];

    if (this.forfeitureForm.invalid) {
      Object.keys(this.forfeitureForm.controls).forEach(key => {
        this.forfeitureForm.controls[key].markAsTouched();
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

  
  async onSubmit(){
    
    if(!await this.validate()){
      return;
    }

    let bondData = {
      forfeiture: {
        date: new Date(this.forfeiture.forfeitureDate),
        satisfyDate: new Date(this.forfeiture.satisfyDate),
        mailingDate: this.forfeiture.mailingDate ? new Date(this.forfeiture.mailingDate) : undefined,
        status: this.forfeiture.status
      }
    }

    const loading = await this.loadingController.create();
    await loading.present();

    this.bondsService
    .updateBond(this.defendantId, this.bond._id, bondData)
    .subscribe(
      async bond => {
        await loading.dismiss();
        this.bondsService.bondUpdated();
        const toast = await this.toastController.create({
          color: 'success',
          duration: 3000,
          message: 'Bond Forfieture Status has been updated.',
          showCloseButton: true,
          position: 'top'
        });
        
        await toast.present();
        await this.modalController.dismiss();
      },
      async errors => {
        await loading.dismiss();
      }
    )
  }

  onForfitureDateChange(){
    this.forfeiture.satisfyDate = moment(this.forfeiture.forfeitureDate).add(126, 'days').format('MMM DD YYYY');
  }

  ngOnChanges(changes: SimpleChanges){
    if (changes.bond) {
      this.initForfeiture();
    }
  }
}
