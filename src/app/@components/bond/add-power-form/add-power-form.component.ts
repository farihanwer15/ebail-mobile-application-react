


import { Component, OnInit, ViewChild, NgModule, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController,ToastController,LoadingController } from '@ionic/angular';
import { PowersService } from '../../../services/powers.service';
import { SuretyService } from '../../../services/surety.service';
import { PrefixService } from '../../../services/prefix.service';
import { UserStore } from 'src/app/@store/user.store';
import { StaffService } from '../../../services/staff.service';
import { NgForm } from '@angular/forms';
 import { OfficeService } from '../../../services/office.service';
import { async } from 'rxjs/internal/scheduler/async';

const _ = require('lodash');

@Component({
  selector: 'app-add-power-form',
  templateUrl: './add-power-form.component.html',
  styleUrls: ['./add-power-form.component.scss'],
})
export class AddPowerFormComponent implements OnInit {

  @ViewChild('powerForm', { static: false }) powerForm: NgForm;

  spinner = false;
  power: any;
  errors = [];
  successMsg = "";
  sureties = [];
  prefixes = [];
  agents = [];
  selectedPrefix = undefined;
  quantity = 0;

  staff = {
    data: [],
    meta: {}
  }

  offices = {
    data: [],
    meta: {}
  }

  constructor(
    private modalController: ModalController,
    private powerService: PowersService,
    private suretyService: SuretyService,
    private prefixSerivce: PrefixService,
     private userStore: UserStore,
    private staffService: StaffService,
     private officeService: OfficeService,
     private loadingController: LoadingController,
     private toastController: ToastController,

  ) {
    this.power = {
      startingPower: undefined,
      endingPower: undefined,
      prefixId: undefined,
      suretyId: undefined,
      receivedDate: undefined,
      expiryDate: undefined,
      assignedAgentId: undefined,
      officeId: undefined
    }
  }

  ngOnInit() {
    this.loadSureties();
    this.loadStaff();
     this.getOffices();
  }

  loadStaff() {
    this.staffService
      .getStaffMembers({
         agencyId: this.userStore.getUser().agencyId,
        sortBy: 'name.first',
        orderBy: 'ASC',
        blocked: false
      })
      .subscribe(
        staff => {
          this.staff = staff;
        }
      )
  }

  getOffices(){
    this.officeService
    .getOffices({
      agencyId: this.userStore.getUser().agencyId
    })
    .subscribe(
      offices => this.offices = offices
    );
  }

  loadSureties() {
    this.showSpinner();
    this.suretyService
      .getSureties({
        agencyId: this.userStore.getUser().agencyId,
        archived: false
      })
      .subscribe(
        sureties => {
          this.sureties = sureties.data;
          this.hideSpinner();
        },
        error => {
          console.log(error);
          this.hideSpinner();
        }
      )
  }

 async loadPrefixes() {
    const loading = await this.loadingController.create({
      message: 'Please wait...'
    });
    await loading.present();
    this.prefixSerivce.getPrefixes({
      suretyId: this.power.suretyId,
      sortBy: 'name',
      orderBy: 'ASC'
    })
      .subscribe(
       async prefixes => {
          console.log('prefixes', prefixes)
          this.prefixes = prefixes.data;
          var collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
          // this.prefixes = this.prefixes.sort(collator.compare)
          this.prefixes = this.prefixes.sort(function (a, b) {
            return collator.compare(a.name, b.name)
          });
          await loading.dismiss();
        
        },
      async  error => {
          console.log(error);
          await loading.dismiss();
         
        }
      )
  }

  onPrefixSelect() {
    this.selectedPrefix = _.find(this.prefixes, (prefix) => {
      return prefix._id === this.power.prefixId;
    });
  }

  onPowerNumberChange() {

    this.errors = [];

    if (this.power.endingPower && this.power.startingPower) {
      this.quantity = parseInt(this.power.endingPower) - parseInt(this.power.startingPower) + 1;
    }

    if (this.quantity > 200) {
      this.errors.push('Maximum 200 powers can be added at a time.');
    }
  }

 async validate() {


    this.errors = [];

    if (this.powerForm.invalid) {
      Object.keys(this.powerForm.controls).forEach(key => {
        this.powerForm.controls[key].markAsTouched();
      });
      this.errors.push('Please fill all required fields.');

      if (this.quantity > 200) {
        //this.errors.push('Maximum 200 powers can be added at a time.');
        const toast = await this.toastController.create({
          color: 'danger',
          duration: 3000,
          message: 'Maximum 200 powers can be added at a time.',
          showCloseButton: true,
          position: 'top'
        });
          await toast.present();
          return false
      }

      return;
    }


    if (!_.isFinite(parseInt(this.power.startingPower))) {
      //this.errors.push('Starting power must be a number.');
      const toast = await this.toastController.create({
        color: 'danger',
        duration: 3000,
        message: 'Starting power must be a number.',
        showCloseButton: true,
        position: 'top'
      });
        await toast.present();
        return false
    }

    if (!_.isFinite(parseInt(this.power.endingPower))) {
      //this.errors.push('Ending power must be a number.');
      const toast = await this.toastController.create({
        color: 'danger',
        duration: 3000,
        message: 'Ending power must be a number.',
        showCloseButton: true,
        position: 'top'
      });
        await toast.present();
        return false
    }

    if (parseInt(this.power.endingPower) < parseInt(this.power.startingPower)) {
    //  this.errors.push('Starting power number must be greater than ending power number.');
      const toast = await this.toastController.create({
        color: 'danger',
        duration: 3000,
        message: 'Starting power number must be greater than ending power number.',
        showCloseButton: true,
        position: 'top'
      });
        await toast.present();
        return false
    }

    if (this.errors.length > 0) {
      const toast = await this.toastController.create({
        color: 'danger',
        duration: 3000,
        message: 'Please fill all required fields.',
        showCloseButton: true,
        position: 'top'
      });
        await toast.present();
        return false
    }
    return true;
  }

 async onSubmit() {
    if (!await this.validate()) {
      return;
    }
    const loading = await this.loadingController.create({
      message: 'Please wait...'
    });
    await loading.present();
    let power = {
      ...this.power,
       agencyId: this.userStore.getAgency()._id
    };
    delete power.suretyId;
    if (power.assignedAgentId === null) {
      delete power.assignedAgentId;
    }

    
    this.powerService.addPower(power)
      .subscribe(
        async power => {
         await loading.dismiss();
          this.powerService.powerAdded(power.insertedId);
          const toast = await this.toastController.create({
            color: 'success',
            duration: 3000,
            message: 'Power added successfully',
            showCloseButton: true,
            position: 'top'
          });
            await toast.present();
            this.closeModal()
        },
      async  errors => {
          this.errors = errors;
          console.log('err',errors)
          await loading.dismiss();
          const toast = await this.toastController.create({
            color: 'danger',
            duration: 3000,
            message: 'Something went wrong please try again',
            showCloseButton: true,
            position: 'top'
          });
            await toast.present();
        }
      )

  }

  showSpinner() {
    this.spinner = true;
  }

  hideSpinner() {
    this.spinner = false;
  }

  async closeModal() {
    await this.modalController.dismiss();
  }
}

@NgModule({
  imports: [

    CommonModule,
    IonicModule,
  ],
  declarations: [AddPowerFormComponent]
})
class ArrestAlertModule {
}
