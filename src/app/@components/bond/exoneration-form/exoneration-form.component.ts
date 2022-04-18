import { Component, OnInit, Input, SimpleChanges, OnChanges, ViewChild } from '@angular/core';
import { ModalController, LoadingController, ToastController } from '@ionic/angular';
import { BondsService } from 'src/app/services/bonds.service';
import { NgForm } from '@angular/forms';
import * as moment from 'moment';

@Component({
  selector: 'app-exoneration-form',
  templateUrl: './exoneration-form.component.html',
  styleUrls: ['./exoneration-form.component.scss'],
})
export class ExonerationFormComponent implements OnInit, OnChanges {

  @ViewChild('exonerationForm', { static: false }) exonerationForm: NgForm;
  
  @Input() defendantId
  @Input() bond;

  exonerate = {
    status: undefined,
    dischargedDate: undefined,
    disposition: undefined,
    description: undefined,
    paidByIndemnitor: undefined 
  }

  bondIndemnitors = [];
  errors = [];

  constructor(
    private loadingController: LoadingController,
    private toastController: ToastController,
    private bondsService: BondsService,
    private modalController: ModalController
  ) { }

  ngOnInit() {}
  
  initForm(){
    if(this.bond && this.bond.exoneration){
      this.exonerate.dischargedDate = this.bond.exoneration.dischargedDate ? this.bond.exoneration.dischargedDate : undefined;
      this.exonerate.status = this.bond.exoneration.status
      this.exonerate.disposition = this.bond.exoneration.disposition ? this.bond.exoneration.disposition : undefined;
      this.exonerate.description = this.bond.exoneration.description;

      if (this.bond.exoneration.paidByIndemnitor) {
        this.exonerate.paidByIndemnitor = this.bond.exoneration.paidByIndemnitor._id;
      }
    }
    if(this.bond.indemnitors){
      this.bondIndemnitors = this.bond.indemnitors;
    }
  }

  
  async validate(){
    this.errors = [];

    if (this.exonerationForm.invalid) {
      Object.keys(this.exonerationForm.controls).forEach(key => {
        this.exonerationForm.controls[key].markAsTouched();
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

    const loading = await this.loadingController.create();
    await loading.present();

    let bondData = {
      exoneration: {
        dischargedDate: this.exonerate.dischargedDate ? new Date(this.exonerate.dischargedDate) : undefined,
        status: this.exonerate.status,
        disposition: this.exonerate.disposition,
        description: this.exonerate.description,
        paidByIndemnitor: this.exonerate.paidByIndemnitor
      } 
    }

    this.bondsService
    .updateBond(this.defendantId, this.bond._id, bondData)
    .subscribe(
      async bond => {
        await loading.dismiss();
        this.bondsService.bondUpdated();

        const toast = await this.toastController.create({
          color: 'success',
          duration: 3000,
          message: 'Bond exoneration status has been updated.',
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

  ngOnChanges(changes: SimpleChanges){
    if (changes.bond) {
      this.initForm();
    }
  }
}
