import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ModalController, ToastController, LoadingController } from '@ionic/angular';
import { UserStore } from 'src/app/@store/user.store';
import { CourtsService } from 'src/app/services/courts.service';
import { CourtDatesService } from 'src/app/services/court-dates.service';
import { NgForm } from '@angular/forms';
import { BondsService } from 'src/app/services/bonds.service';

@Component({
  selector: 'app-court-date-form',
  templateUrl: './court-date-form.component.html',
  styleUrls: ['./court-date-form.component.scss'],
})
export class CourtDateFormComponent implements OnInit {

  @ViewChild('courtDateForm', { static: false }) courtDateForm: NgForm;

  @Input() bondId;
  @Input() courtDate;

  court = {
    date: undefined,
    roomNumber: undefined,
    officeNumber: undefined,
    purpose: undefined,
    status: undefined,
    comments: undefined,
    caseNumber: undefined
  };

  courts = {
    data: [],
    meta: {}
  };

  errors = [];

  constructor(
    private modalController: ModalController,
    private toastController: ToastController,
    private courtDatesService: CourtDatesService,
    private loadingController: LoadingController,
    private bondsService: BondsService
  ) { }

  ngOnInit() {
    this.initCourtDateData();
  }

  initCourtDateData(){
    if (this.courtDate) {
      this.court = this.courtDate;
    }
  }

  closeModal(){
    this.modalController.dismiss();
  }


  async validate(){

    this.errors = [];

    if (this.courtDateForm.invalid) {
      Object.keys(this.courtDateForm.controls).forEach(key => {
        this.courtDateForm.controls[key].markAsTouched();
      });
      this.errors.push('Please fill all required fields.');
    }

    if(!this.bondId){
      this.errors.push('Bond id is either invalid or not present.');
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

    if(this.courtDate && this.courtDate._id){
      this.updateCourtDate();
    }
    else{
      this.addCourtDate();
    }

  }

  async addCourtDate(){
    let courtDate = {
      bondId: this.bondId,
      date: this.court.date ? this.court.date : undefined,
      roomNumber: this.court.roomNumber ? this.court.roomNumber : undefined,
      officeNumber: this.court.officeNumber ? this.court.officeNumber : undefined,
      purpose: this.court.purpose ? this.court.purpose : undefined,
      comments: this.court.comments ? this.court.comments : undefined,
      caseNumber: this.court.caseNumber ? this.court.caseNumber : undefined
    }

    const loading = await this.loadingController.create({
      message: 'Please wait...'
    });
    await loading.present();

    this.courtDatesService.addCourtDate(courtDate)
    .subscribe(
      async courtDate => {
        this.courtDatesService.courtDateAdded(courtDate.insertedId);

        const toast = await this.toastController.create({
          color: 'success',
          duration: 3000,
          message: 'Court date has been added successfully.',
          showCloseButton: true,
          position: 'top'
        });
  
        
        this.bondsService.bondUpdated();

        await toast.present();
        
        await loading.dismiss();
        await this.modalController.dismiss();
      },
      error => {
        if(error.details){
          error.details.forEach(err => {
            this.errors.push(err.message);
          });
        }
        loading.dismiss();
      }
    );
  }

  async updateCourtDate(){
    let courtDate = {
      bondId: this.bondId,
      date: this.court.date ? this.court.date : undefined,
      roomNumber: this.court.roomNumber ? this.court.roomNumber : undefined,
      officeNumber: this.court.officeNumber ? this.court.officeNumber : undefined,
      purpose: this.court.purpose ? this.court.purpose : undefined,
      comments: this.court.comments ? this.court.comments : undefined,
      caseNumber: this.court.caseNumber ? this.court.caseNumber : undefined
    }

    const loading = await this.loadingController.create({
      message: 'Please wait...'
    });
    await loading.present();
    
    this.courtDatesService
    .updateCourtDate(this.courtDate._id, courtDate)
    .subscribe(
      async courtDate => {
        loading.dismiss();
        this.courtDatesService.courtDateAdded();
        
        const toast = await this.toastController.create({
          color: 'success',
          duration: 3000,
          message: 'Court date has been updated successfully.',
          showCloseButton: true,
          position: 'top'
        });

        
        this.bondsService.bondUpdated();
  
        await toast.present();
        await this.modalController.dismiss();
      },
      error => {
        if(error.details){
          error.details.forEach(err => {
            this.errors.push(err.message);
          });
        }
        loading.dismiss();
      }
    );
  }

}
