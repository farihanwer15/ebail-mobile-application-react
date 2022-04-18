import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ModalController, LoadingController, ToastController } from '@ionic/angular';
import { NotesService } from 'src/app/services/notes.service';
import { UserStore } from 'src/app/@store/user.store';
import { NgForm } from '@angular/forms';
import { DefendantsService } from 'src/app/services/defendants.service';
import { InvoicesService } from "src/app/services/invoices.service";
import * as _ from 'lodash';

@Component({
  selector: 'app-note-form',
  templateUrl: './note-form.component.html',
  styleUrls: ['./note-form.component.scss'],
})
export class NoteFormComponent implements OnInit {

  @ViewChild('noteForm', {static: false}) noteForm: NgForm;
  @Input() defendantId;  
  @Input() noteId;
  @Input() bondId;
  @Input() type;

  note = {
    text: undefined,
    type: 'defendant',
    bondId: undefined,
    invoiceId: undefined,
    tags: []
  }
  invoices = [];

  tags = [
    'General',
    'Collections',
    'Court',
    'Forfeiture',
    'Invoice',
    'Payment',
    'Recovery',
    'Urgent'
  ];

  errors = [];
  bonds = [];
  recoveryAgent = false;
  
  constructor(
    private modalController: ModalController,
    private notesService: NotesService,
    private userStore: UserStore,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private defService: DefendantsService,
    private invoiceService: InvoicesService

  ) { }

  ngOnInit() {

    
    if(this.userStore.getUser() && this.userStore.getUser().roles && this.userStore.getUser().roles.recoveryAgent){
      this.recoveryAgent = true;
      this.tags = ['Recovery', 'Urgent'];
    }

    this.getDefendant();
    this.getDefendantInvoices();
    this.getNoteData();
  }
  

  async closeModal() {
    await this.modalController.dismiss();
  }
  getDefendantInvoices(invoiceId = null){
    this.invoiceService.getInvoices({
      defendantId: this.defendantId
    })
    .subscribe(
      invoices => {
        this.invoices = invoices.data;
      },
      errors => {
      }
    )
  }
  
  getDefendant(bondId = null){
    if (this.defendantId) {
      this.defService
      .getDefendant(this.defendantId)
      .subscribe(
        def => {
         
          this.bonds = def.bonds ? def.bonds : [];
          
          if(this.bonds.length > 0 && !bondId){
            this.note.bondId = this.bonds[0]._id;
          }
          else{
            this.note.bondId = bondId;
          }
        }
      )
    }
  }
  
  async getNoteData(){
    if(this.noteId){
      
      const loading = await this.loadingController.create();
      await loading.present();
      
      this.notesService
      .getNote(this.noteId)
      .subscribe(
        async note => {
          await loading.dismiss();
          this.note.text = note.note;
          this.note.type = note.type;
           this.note.bondId = note.bondId;

          if(note.type === 'forfeiture'){
            this.getDefendant(note.bondId);
          }
        },
        async errors => {
          console.log(errors);
          await loading.dismiss();
        }
      )
    }
  }

  showField(fieldName){
    if (this.note.tags.indexOf(fieldName) >= 0) {
    
      return true;

    }
   
     return false
  }
  async validate(){
    this.errors = [];

    if (this.noteForm.invalid) {
      Object.keys(this.noteForm.controls).forEach(key => {
        this.noteForm.controls[key].markAsTouched();
      });
      this.errors.push('Please fill all required fields.');
      return;
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

  onSubmit(){
    if (!this.validate()) {
      return;
    }

    let bondData = undefined;
    if (this.note.bondId) {
      const bond = _.find(this.bonds, b => {
        return b._id === this.note.bondId;
      });

      if (bond) {
        bondData = {
          _id: bond._id,
        }
        if (bond.power && bond.power.prefix) {
          bondData.power = `${bond.power.prefix.name}-${bond.power.number}`
        }
        if (bond.bondNumber) {
          bondData.bondNumber = bond.bondNumber
        }
      }
    }

    let invoiceData = undefined;
    if (this.note.invoiceId) {
      const invoice = _.find(this.invoices, inv => {
        return inv._id === this.note.invoiceId;
      });

      if (invoice) {
        invoiceData = {
          _id: invoice._id,
          number: invoice.number,
          amount: invoice.totalAmount
        }
      }
    }

    let noteData = {
      belongsToUserId: this.defendantId,
      addedByUserId: this.userStore.getUser().id,
      // bondId: this.note.bondId,
      bond: bondData,
      invoice: invoiceData,
      note: this.note.text,
      // type: this.note.type,
      tags: this.note.tags
    };

    if(this.noteId){
      this.updateNote(noteData)
    }
    else{
      this.addNote(noteData);
    }

  }

  
  async addNote(data){
    const loading = await this.loadingController.create();
    await loading.present();
    
    this.notesService
    .addNote(data)
    .subscribe(
      async note => {
        await loading.dismiss();
        
        const toast = await this.toastController.create({
          color: 'success',
          duration: 3000,
          message: 'Note has been added successfully.',
          showCloseButton: true,
          position: 'top'
        });
  
        await toast.present();
        this.closeModal();

        this.notesService.noteAdded(this.note.type);
      },
      async errors => {
        await loading.dismiss();
        console.log(errors);
      }
    );
  }

  async updateNote(data){
    const loading = await this.loadingController.create();
    await loading.present();

    this.notesService
    .updateNote(this.noteId, data)
    .subscribe(
      async note => {
        await loading.dismiss();
        
        const toast = await this.toastController.create({
          color: 'success',
          duration: 3000,
          message: 'Note has been updated successfully.',
          showCloseButton: true,
          position: 'top'
        });
  
        await toast.present();

        this.closeModal();
        this.notesService.noteAdded(this.note.type);
      },
      async errors => {
        await loading.dismiss();
        console.log(errors);
      }
    );
  }

  onTypeChange(){
    if(this.note.type === 'forfeiture'){
      this.getDefendant();
    }
  }


}
