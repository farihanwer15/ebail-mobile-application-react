import { Component, OnInit,ViewChild, Input } from '@angular/core';
import { ModalController, ToastController, LoadingController } from '@ionic/angular';
import { NgForm } from '@angular/forms';
import { UserStore } from 'src/app/@store/user.store';
import { CourtsService } from '../../../services/courts.service';
import { async } from '@angular/core/testing';
const _ = require('lodash');

@Component({
  selector: 'app-add-court-form',
  templateUrl: './add-court-form.component.html',
  styleUrls: ['./add-court-form.component.scss'],
})
export class AddCourtFormComponent implements OnInit {
  @ViewChild('courtForm', { static: false }) courtForm: NgForm;
  @Input() courtId;

  court = {
    name: undefined,
    phone: undefined,
    fax: undefined,
    email: undefined,
    address: {
      line1: undefined,
      state: undefined,
      county: undefined,
      city: undefined,
      zipcode: undefined
    }
  };
  errors = [];
  states: Array<any> = [];
  counties: Array<any> = [];

  constructor(
    private modalController: ModalController,
    private userStore: UserStore,
    private courtsService: CourtsService,
    private toastController: ToastController,

  ) { }

  ngOnInit() {
    this.getStates();
    this.getCourt();
  }
  getStates(){
    this.states = this.userStore.getStates();
  }
  getCounties(){
    this.counties = this.userStore.getCountiesByState(this.court.address.state);
  }
  getCourt(){
    if (this.courtId){

      this.courtsService
      .getCourt(this.courtId)
      .subscribe(
        court => {
        
          this.court.name = court.name;
          this.court.address = {
            line1: court.address.line1,
            state: court.address.state,
            county: court.address.county,
            city: court.address.city,
            zipcode: court.address.zipcode
          };
          this.court.email = court.email;

          this.court.email = _.result(_.find(court.contacts, (contact) => {
            return contact.key === 'Email';
          }), 'value');

          
          this.court.phone = _.result(_.find(court.contacts, (contact) => {
            return contact.key === 'Phone';
          }), 'value');
          
          
          this.court.fax = _.result(_.find(court.contacts, (contact) => {
            return contact.key === 'Fax';
          }), 'value');

          this.getCounties();
        },
        errors => {
        }
      );

    }
  }


  validate(): Boolean{
    
    this.errors = [];

    if (this.courtForm.invalid) {
      Object.keys(this.courtForm.controls).forEach(key => {
        this.courtForm.controls[key].markAsTouched();
      });
      this.errors.push('Please fill all required fields.');
      return;
    }
    
    if(this.errors.length > 0){
      return false;
    }
    return true;
  }

  onSubmit(){
    if(!this.validate()){
      return;
    }

    if(this.courtId){
       this.updateCourt();
    }
    else{
    
     this.addCourt();
    }
  }

 async addCourt(){
    let courtData: any = {
      agencyId: this.userStore.getUser().agencyId,
      name: this.court.name ? this.court.name : undefined,
      address: {
        line1: this.court.address.line1 ? this.court.address.line1 : undefined,
        state: this.court.address.state ? this.court.address.state : undefined,
        county: this.court.address.county ? this.court.address.county.trim() : undefined,
        city: this.court.address.city ? this.court.address.city : undefined,
        zipcode: this.court.address.zipcode ? this.court.address.zipcode : undefined,
      }
    };

    let contacts = [];
    if(this.court.phone){
      contacts.push({
        key: 'Phone',
        value: this.court.phone
      });
    }
    if(this.court.fax){
      contacts.push({
        key: 'Fax',
        value: this.court.fax
      });
    }
    if(this.court.email){
      contacts.push({
        key: 'Email',
        value: this.court.email
      });
    }

    if(contacts.length > 0){
      courtData.contacts = contacts;
    }

   //this.spinner = true;
    this.courtsService.addCourt(courtData)
    .subscribe(
     async court => {
        this.courtsService.courtAdded(court.insertedId);
        const toast = await this.toastController.create({
          color: 'success',
          duration: 3000,
          message: 'Court has been added successfully.',
          showCloseButton: true,
          position: 'top'
        });
      await toast.present();
      this.closeModal();
      },
      error => {
        if(error.details){
          error.details.forEach(err => {
            this.errors.push(err.message);
          });
        }
       
      }
    );
  }

 async updateCourt(){
    let courtData: any = {
      name: this.court.name,
      address: {
        line1: this.court.address.line1,
        state: this.court.address.state,
        county: this.court.address.county,
        city: this.court.address.city,
        zipcode: this.court.address.zipcode,
      }
    };

    let contacts = [];
    if(this.court.phone){
      contacts.push({
        key: 'Phone',
        value: this.court.phone
      });
    }
    if(this.court.fax){
      contacts.push({
        key: 'Fax',
        value: this.court.fax
      });
    }
    if(this.court.email){
      contacts.push({
        key: 'Email',
        value: this.court.email
      });
    }

    if(contacts.length > 0){
      courtData.contacts = contacts;
    }
    this.courtsService.updateCourt(this.courtId, courtData)
    .subscribe(
      async court => {
        this.courtsService.courtAdded(court.insertedId);
        const toast = await this.toastController.create({
          color: 'success',
          duration: 3000,
          message: 'Court has been Updated successfully.',
          showCloseButton: true,
          position: 'top'
        });
         await toast.present();
          this.closeModal();
       },
      error => {
        if(error.details){
          error.details.forEach(err => {
            this.errors.push(err.message);
          });
        }
       // this.spinner = false;
      }
    );
  }




  closeModal(){
    this.modalController.dismiss();
  }

}
