import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { LoadingController, ModalController, ToastController } from '@ionic/angular';
import { UserStore } from 'src/app/@store/user.store';
import { DefendantsService } from 'src/app/services/defendants.service';
import { ReceiptsService } from "../../../services/receipts.service";

import * as moment from 'moment';
import * as _ from 'lodash';

@Component({
  selector: 'app-defendant-form',
  templateUrl: './defendant-form.component.html',
  styleUrls: ['./defendant-form.component.scss'],
})
export class DefendantFormComponent implements OnInit {

  @ViewChild('defendantForm', { static: false }) defendantForm: NgForm;
  @Input() defendantId;

  errors = [];

  defendant: any = {
    name: {
      first: undefined,
      last: undefined,
      middle: undefined,
      maiden: undefined,
      alias: undefined
    },
    phone: undefined,
    ssn: undefined,
    email: undefined,
    gender: 'male',
    citizenship: 'US Citizen',
    address: {
      line1: undefined,
      line2: undefined,
      state: undefined,
      county: undefined,
      zipcode: undefined,
      city: undefined
    },
    features: {
      height: {
        feet: undefined,
        inches: undefined
      },
      weight: undefined,
      race: undefined,
      eyeColor: undefined,
      hairColor: undefined,
      skinColor: undefined,
      description: undefined
    },
    drivingLicense: {
      number: undefined,
      state: undefined,
      expiryDate: undefined
    }
  };

  states = [];
  counties = [];
  files = [];

  contact = {
    type: undefined,
    number: undefined,
    primary: false
  }

  showContactForm = false;

  contacts = []
  avatar= undefined
  constructor(
    private defService: DefendantsService,
    private toastController: ToastController,
    private loadingController: LoadingController,
    private userStore: UserStore,
    private modalController: ModalController,
    private receiptsService: ReceiptsService,
    private defendantsService: DefendantsService,

  ) { }

  ngOnInit() {
    this.getStates();
    this.getDefendantData();
  }
  onFileChange(event){
    console.log('event',event)
    for (const [key, value] of Object.entries(event.target.files)) {
      this.files.push(value);
    }
    this.uploadAvatar();
  }
  deleteAvatar(){
    this.defendantsService.removeAvatar(this.defendantId).subscribe((res)=>{
      this.getDefendantData()
    },error=>{console.log(error)})
  }

 async uploadAvatar(){

    if(!this.validate()){
      return;
    }
    const loading = await this.loadingController.create({
      message: 'Please wait...'
    });
    await loading.present();
  
    let formData = new FormData();
    this.files.forEach(file => {
      console.log('file', file)
      formData.append('file', file);
    })
    
    this.defendantsService
    .uploadAvatar(formData, this.defendantId)
    .subscribe(
      async res => {
        await loading.dismiss();
        const toast = await this.toastController.create({
          color: 'success',
          duration: 3000,
          message: 'Defendant image updated successfully',
          showCloseButton: true,
          position: 'top'
        });
  
        await toast.present();
  
        // this.toastrService.show('', 'Defendant image updated successfully', {
        //   status: 'success'
        // });
        this.getDefendantData()
        this.files = [];
       
        // this.saveReceipt(res);
      },
     async errors => {
        await loading.dismiss();
        
      }
    )
  }
 async getDefendantData(){
    
    if(this.defendantId){
      const loading = await this.loadingController.create({
        message: 'Please wait...'
      });
      await loading.present();
      this.defService
      .getDefendant(this.defendantId)
      .subscribe(
       async def => {
          this.defendant.name = def.name;
          this.defendant.ssn = def.ssn;
          this.defendant.email = def.email;
          this.defendant.gender = def.gender ? def.gender : 'male';
          this.defendant.citizenship = def.citizenship ? def.citizenship : 'US Citizen';
          this.defendant.features = def.features ? def.features : this.defendant.features;
          this.defendant.address = def.address ? def.address : this.defendant.address;
          this.defendant.drivingLicense = def.drivingLicense ? def.drivingLicense : this.defendant.drivingLicense;

          if(this.defendant.drivingLicense && this.defendant.drivingLicense.expiryDate){
            this.defendant.drivingLicense.expiryDate = moment(this.defendant.drivingLicense.expiryDate);
          }
          if(def.avatar){
            this.getPresignedUrlForAvatar(def.avatar)
          }else{
            this.avatar  =undefined
          }

          this.defendant.phone = _.result(_.find(def.contacts, (contact) => {
            return contact.key === 'Phone';
          }), 'value');

          if (def.dob) {
            this.defendant.dob = moment(def.dob).utc(true).format('YYYY-MM-DD');
          }

          this.contacts = def.contacts ? def.contacts : [];
          await loading.dismiss();

        },
      async  errors => {
          await loading.dismiss();
        }
      )
    }
  }
  getPresignedUrlForAvatar(avatar){
    this.receiptsService
    .getPresignedUrl({
      key: avatar.filename
    })
    .subscribe(
      res => {
        console.log('ava', res)
        this.avatar = res.url
      }
    )
  }
  
  closeModal(){
    this.modalController.dismiss();
  }

  getStates(){
    this.states = this.userStore.getStates();
  }
  getCounties(){
    this.counties = this.userStore.getCountiesByState(this.defendant.address.state);
  }

  async validate(){

    this.errors = [];

    if (this.defendantForm.invalid) {
      Object.keys(this.defendantForm.controls).forEach(key => {
        this.defendantForm.controls[key].markAsTouched();
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

    let defData: any = {
      name:  this.defendant.name,
      email: this.defendant.email,
      ssn: this.defendant.ssn,
      gender: this.defendant.gender,
      features: this.defendant.features,
      drivingLicense: this.defendant.drivingLicense.number ? this.defendant.drivingLicense: undefined,
      address: this.defendant.address.line1 ? this.defendant.address : undefined,
      citizenship: this.defendant.citizenship,
      dob: this.defendant.dob
    };

    if(this.defendant.phone){
      defData.contacts = [{
        key: 'Phone',
        value: this.defendant.phone
      }];
    }
    
    const loading = await this.loadingController.create({
      message: 'Please wait...'
    });
    await loading.present();

    this.defService
    .updateDefendant(this.defendantId, defData)
    .subscribe(
      async def => {

        const toast = await this.toastController.create({
          color: 'success',
          duration: 3000,
          message: 'Defendant information saved successfully.',
          showCloseButton: true,
          position: 'top'
        });
  
        await toast.present();
        await loading.dismiss();

        this.defService.defendantAdded(null);
        this.closeModal()
      },
      async errors => {
        await loading.dismiss();
      }
    )
  }

}
