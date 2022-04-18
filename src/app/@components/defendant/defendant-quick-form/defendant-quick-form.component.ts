import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ModalController, ToastController, LoadingController } from '@ionic/angular';
import { UserStore } from 'src/app/@store/user.store';
import { DefendantsService } from 'src/app/services/defendants.service';
import { NgForm } from '@angular/forms';
import { IndemnitorsService } from 'src/app/services/indemnitors.service';

import * as moment from 'moment';
@Component({
  selector: 'app-defendant-quick-form',
  templateUrl: './defendant-quick-form.component.html',
  styleUrls: ['./defendant-quick-form.component.scss'],
})
export class DefendantQuickFormComponent implements OnInit {
  
  @ViewChild('defendantForm', { static: true }) defendantForm: NgForm;

  errors = [];

  defendant = {
    name: {
      first: undefined,
      last: undefined
    },
    officeId: undefined,
    email: undefined,
    callDate: undefined,
    phone: undefined,
    dob: undefined,
    status: 'on-boarded'
  };

  indemnitor = {
    name: {
      first: undefined,
      last: undefined,
    },
    phone: undefined,
    email: undefined,
    relation: undefined
  }

  constructor(
    private modalController: ModalController,
    private userStore: UserStore,
    private defService:DefendantsService,
    private toastController: ToastController,
    private loadingController: LoadingController,
    private indemService: IndemnitorsService
  ) { }

  ngOnInit() {}

  async closeModal() {
    await this.modalController.dismiss();
  }

  async validate(){
    this.errors = [];

    if (this.defendantForm.invalid) {
      Object.keys(this.defendantForm.controls).forEach(key => {
        this.defendantForm.controls[key].markAsTouched();
      });
      this.errors.push('Please fill all required fields.');

      // let birthday = this.defendant.dob;
      // const age = moment().diff(birthday, 'years');
      
      // if(age < 10){
      //   this.errors.push('Defendant age must be 10 years or older.');
      // }

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
    
    if(this.errors.length > 0){
      return false;
    }
    return true;
  }

  async onSubmit(){
    if (!await this.validate()) {
      return;
    }

    let indemData:any = {
      name: this.indemnitor.name,
      email: this.indemnitor.email !== null ? this.indemnitor.email : undefined,
      agencyId: this.userStore.getUser().agencyId,
      officeId: this.userStore.getUser().office._id,
      roles: {
        indemnitor: true
      },
    }

    let contacts = [];
    if(this.indemnitor.phone){
      contacts.push({
        key: 'Phone',
        value: this.indemnitor.phone
      });
    }
    indemData.contacts = contacts.length > 0 ? contacts : undefined;
    
    const loading = await this.loadingController.create({
      message: 'Please wait...',
    });
    await loading.present();

    this.indemService.addIndemnitor(indemData)
    .subscribe(indem => {
      //IF INDEMNITOR SUCCESSFULLY ADDED ADD DEFENDANT
      this.addDefendant(indem.insertedId, contacts, loading);
    },
    errors => {
      console.log(errors);
      // errors.details.forEach(err => {
      //   this.errors.push(err.message);
      // });
      loading.dismiss();
    });
  }

  
  addDefendant(indemnitorId, indemContacts, loading){

    let defendantData: any = {
      name: this.defendant.name,
      email: this.defendant.email !== null ? this.defendant.email : undefined,
      agencyId: this.userStore.getUser().agencyId,
      officeId: this.userStore.getUser().office._id,
      roles: {
        defendant: true
      },
      callDate: new Date(),
      indemnitors: [{
        _id: indemnitorId,
        name: {
          first: this.indemnitor.name.first,
          last: this.indemnitor.name.last
        },
        email: this.indemnitor.email,
        contacts: indemContacts.length > 0 ? indemContacts : undefined,
        relation: this.indemnitor.relation
      }],
      selfIndemnitor: false,
      postingAgentId: this.userStore.getUser().id,
      dob: this.defendant.dob,
    }

    let contacts = [];
    if(this.defendant.phone){
      contacts.push({
        key: 'Phone',
        value: this.defendant.phone
      });
    }
    defendantData.contacts = contacts.length > 0 ? contacts : undefined;

    if(this.defendant.status === 'on-boarded'){
      defendantData.onBoardedAt = new Date();
      defendantData.onBoardedByUserId = this.userStore.getUser().id;
    }


    this.defService.addDefendant(defendantData)
    .subscribe(async defendant => {
      
      this.defService.defendantAdded(defendant.insertedId);
      
      const toast = await this.toastController.create({
        color: 'success',
        duration: 3000,
        message: 'Defendant has been added successfully.',
        showCloseButton: true,
        position: 'top'
      });

      await toast.present();
      this.closeModal();

      loading.dismiss();
    },
    errors => {
      console.log(errors);
      // errors.details.forEach(err => {
      //   this.errors.push(err.message);
      // });
      loading.dismiss();
    })
  }
}
