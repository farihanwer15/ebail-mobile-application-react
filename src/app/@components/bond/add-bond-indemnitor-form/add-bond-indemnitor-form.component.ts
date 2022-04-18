import { Component, OnInit, ChangeDetectorRef, Input, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { BondsService } from 'src/app/services/bonds.service';
import { ToastController, ModalController, LoadingController } from '@ionic/angular';
import { CollateralsService } from 'src/app/services/collaterals.service';
import { DefendantsService } from '../../../services/defendants.service';
import { IndemnitorsService } from '../../../services/indemnitors.service';

const moment = require('moment');
const _ = require('lodash');
import * as _ from 'lodash';
import { BondCollateralsService } from 'src/app/services/bond-collaterals.service';
import { UserStore } from '../../../@store/user.store';

@Component({
  selector: 'app-add-bond-indemnitor-form',
  templateUrl: './add-bond-indemnitor-form.component.html',
  styleUrls: ['./add-bond-indemnitor-form.component.scss'],
})
export class AddBondIndemnitorFormComponent implements OnInit {

  @Input() defendantId;
  @Input() indemnitorId;
  @Input() bondId;
  @Input() relation;
  
  @ViewChild('indemnitorForm', { static: false }) indemnitorForm: NgForm;
  @ViewChild('addressText', {static: false}) addressText: any;
  spinner: Boolean = false;
  errors = [];
  showContactForm = false;
  showAltAddress: Boolean = false;
  editAltAddressIndex : number;

  indem = {
    name: {
      first: undefined,
      last: undefined
    },
    email: undefined,
    phone: undefined,
    gender: 'male',
    ssn: undefined,
    dob: undefined,
    address: {
      line1: undefined,
      state: undefined,
      county: undefined,
      city: undefined,
      zipcode: undefined
    },
    contacts: [],
    altAddresses:[],
    relation: undefined,
    updateDefendantProfile: true
  }
  currentAltAddress =
  {
    line1: undefined,
    state: undefined,
    county: undefined,
    city: undefined,
    zipcode: undefined,
  }
  states = [];
  counties = [];
  contact = {
    type: undefined,
    number: undefined,
    primary: false
  }

  constructor(
    private collateralsService: BondCollateralsService,
    private bondsService: BondsService,
    private toastController: ToastController,
    private modalController: ModalController,
    private loadingController: LoadingController,
    private defService: DefendantsService,
    private userStore: UserStore,
    private bondService: BondsService,
    private indemService: IndemnitorsService,
    private cdRef: ChangeDetectorRef,
  ) { }

  ngOnInit() {
    this.getDefendant();

  }
  addAddress(){
  
    this.showAltAddress = false
    this.currentAltAddress =
       {
         line1: undefined,
         state: undefined,
         county: undefined,
         city: undefined,
         zipcode: undefined,
       }
   
     }
     editAltAddress (address, i) {
      this.editAltAddressIndex = i;
      this.currentAltAddress = address;
      this.showAltAddress = true;
    }
    addNewAddress(){
      this.showAltAddress = true
    }
   async validateContact() {
      this.errors = [];
     if(!this.contact.type){
       this.errors.push('Please fill all required fields.')

     }
     if(!this.contact.number){
      this.errors.push('Please fill all required fields.')
     }
  
      if (this.errors.length > 0) {
        return false;
      }
      return true;
    }
 async addContact(){
    if (!await this.validateContact()) {
      const toast = await this.toastController.create({
        color: 'danger',
        duration: 3000,
        message: 'Please fill all required fields.',
        showCloseButton: true,
        position: 'top'
      });
      await toast.present();

      return;
    }
    if(this.contact.primary && this.indem.contacts.length){
      const newState = this.indem.contacts.map(obj =>
        obj.primary ? { ...obj, primary: false } : obj
    );
    let contact= {
      key: this.contact.type,
      value: this.contact.number,
      primary: this.contact.primary
    } 
    newState.push(contact)
    this.indem.contacts = newState
    console.log('contact', this.indem)
    this.resetContact();
    this.showContactForm = false;

  
  
    }else{
      const newContact =this.indem.contacts
      let contact= {
        key: this.contact.type,
        value: this.contact.number,
        primary: this.contact.primary
      } 
      newContact.push(contact)
      this.indem.contacts = newContact
      console.log('contact', this.indem)

      this.resetContact();
      this.showContactForm = false;
  }
  }

  removeContact(index){
    this.indem.contacts.splice(index,1)
  }
  resetContact(){
    this.contact = {
      type: undefined,
      number: undefined,
      primary: false
    }
  }
  toggleContactForm(bool){
    this.showContactForm = bool;
    if (!bool) {
      //this.resetContact();
    }
  }
 
  getDefendant(){
    if(this.indemnitorId){

      this.spinner = true;
      this.defService.getDefendant(this.defendantId)
      .subscribe(
        def => {
          let indem = _.find(def.indemnitors, (i) => {
            return i._id === this.indemnitorId;
          })
          if (this.bondId) {
            const bond = _.find(def.bonds, (b) => {
              return b._id === this.bondId;
            })

           
          }
     
          this.spinner = false;
          this.indem.name = indem.name;
          this.indem.email = indem.email;
          this.indem.gender = indem.gender;
          this.indem.ssn = indem.ssn;
          this.indem.dob = moment(indem.dob).format("MM/DD/YYYY");
          this.indem.address = indem.address ? indem.address : this.indem.address;
          this.indem.relation = indem.relation;
          this.indem.contacts = indem.contacts ? indem.contacts : [] ,
          this.indem.altAddresses = indem.altAddresses ? indem.altAddresses : []
          // this.getCounties();

          this.indem.phone = _.result(_.find(indem.contacts, (contact) => {
            return contact.key === 'Phone';
          }), 'value');

        },
        errors => {
          this.spinner = false;
        }
      )
    }
  }
  onCheckChange(checked){
    if(checked){
      this.indem.address =this.currentAltAddress
    }
   }
  setAddress(address){   
    if (this.editAltAddressIndex || this.editAltAddressIndex ===0 ) {
      this.indem.altAddresses.splice(this.editAltAddressIndex, 1, address);
      this.cdRef.detectChanges();

    } else {
      this.indem.altAddresses.push(address)
      this.cdRef.detectChanges();
    }

  }
  deleteAddress(index){
    this.indem.altAddresses.splice(index,1)

  }

 async onSubmit() {
    if (!await this.validate()) {
      return;
    }

    let indemData: any = {
      name: {
        first: this.indem.name.first,
        last: this.indem.name.last
      },
      email: this.indem.email,
      ssn: this.indem.ssn || undefined,
      gender: this.indem.gender,
      dob: this.indem.dob ? this.indem.dob : undefined,
      address: this.indem.address.line1 ? this.indem.address : undefined,
      agencyId: this.userStore.getUser().agencyId,
      officeId: this.userStore.getUser().office._id,
      relation: this.indem.relation,
      altAddresses: this.indem.altAddresses.length ? this.indem.altAddresses : [],
      contacts: this.indem&&this.indem.contacts&&this.indem.contacts.length ? this.indem.contacts  : [],
    };

    // if (this.indem.phone) {
    //   indemData.contacts = [{
    //     key: 'Phone',
    //     value: this.indem.phone
    //   }]
    // }

    if (this.indemnitorId && this.bondId) {
      this.updateBondIndemnitor(indemData);
    }
    else if(this.indemnitorId){
      this.updateIndemnitor(indemData);
    }
    else{
      this.addIndemnitor(indemData);
    }

  }
  async addIndemnitor(indemData){
    
    this.spinner = true;
    this.defService.addIndemnitor(this.defendantId, indemData)
      .subscribe(
        async indem => {
          this.spinner = false;

          this.indemService.indemnitorAdded(indem);
          const toast = await this.toastController.create({
            color: 'success',
            duration: 3000,
            message: 'Bond indemnitor has been added successfully.',
            showCloseButton: true,
            position: 'top'
          });
          this.spinner = false;
          this.defService.indemnitorsAdded(indem);
        await toast.present();
        this.closeModal();
        },
        errors => {
          this.spinner = false;
        }
      );
  }
 async updateBondIndemnitor(data){
    this.spinner = true;
    this.bondService
    .updateBondIndemnitor(this.defendantId, this.bondId, this.indemnitorId, data)
    .subscribe(
      async res => {
        const toast = await this.toastController.create({
          color: 'success',
          duration: 3000,
          message: 'Bond indemnitor has been updated successfully.',
          showCloseButton: true,
          position: 'top'
        });
        
       

        if (this.indem.updateDefendantProfile) {
          this.updateIndemnitor(data);
        }

        this.bondService.bondUpdated();
        this.spinner = false;
        await toast.present();
        this.closeModal();

      },
      err =>{
        this.spinner = false
      }
    )
  }
 async updateIndemnitor(indemData){


    this.spinner = true;
    this.defService.updateIndemnitor(this.defendantId, this.indemnitorId, indemData)
      .subscribe(
        async indem => {
          this.spinner = false;
          
          const toast = await this.toastController.create({
            color: 'success',
            duration: 3000,
            message: 'Indemnitor has been updated successfully.',
            showCloseButton: true,
            position: 'top'
          });
          this.indemService.indemnitorAdded(indem);
          await toast.present();
          this.closeModal();
        },
        errors => {
        }
      );
  }
  async closeModal(){
    await this.modalController.dismiss();
  }

 
 async validate() {
    this.errors = [];

    if (this.indemnitorForm.invalid) {
      Object.keys(this.indemnitorForm.controls).forEach(key => {
        this.indemnitorForm.controls[key].markAsTouched();
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

}
