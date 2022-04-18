import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { PettyCashService } from '../../../services/petty-cash.service';
import { UserStore } from '../../../@store/user.store';
import { DefendantsService } from '../../../services/defendants.service';
import { ReceiptsService } from '../../../services/receipts.service';
import * as _ from 'lodash';
import { ToastController, ModalController, LoadingController } from '@ionic/angular';
import { async } from '@angular/core/testing';
import { IonicSelectableComponent } from 'ionic-selectable';

@Component({
  selector: 'app-petty-cash-spent-form',
  templateUrl: './petty-cash-spent-form.component.html',
  styleUrls: ['./petty-cash-spent-form.component.scss'],
})
export class PettyCashSpentFormComponent implements OnInit {
  @Input() staffMemberId;
  @Input() pettyCashId;
  @ViewChild('pettyCashForm', { static: false }) pettyCashForm: NgForm;
  @ViewChild("externalPdfViewer", { static: true }) externalPdfViewer;

  errors = [];
  pettyCash = {
    amount: undefined,
    category: undefined,
    otherCategory: undefined,
    description: undefined,
    defendantId: undefined,
    bondId: undefined,
  }
  bonds = [];
  defendants = [];
  jailReceipt = undefined;
  pettyCashReceipts= [];
  
  files = [];
  
  document = {
    name: undefined,
    type: undefined,
  };
  constructor(
    private pettyCashService: PettyCashService,
    private userStore: UserStore,
    private defService: DefendantsService,
    private receiptService: ReceiptsService,
    private modalController: ModalController,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private receiptsService: ReceiptsService,



  ) { 
  }

  ngOnInit() {
    this.getPettyCashData();
    this.getPettyCashReceipts();
  }
  getPettyCashReceipts(){
    if (this.pettyCashId) {
      this.receiptService.getReceipts({
        pettyCashId: this.pettyCashId
      })
      .subscribe(receipts => {
        this.pettyCashReceipts = receipts.data
        
      })
    }
  } 
  async closeModal(){
    await this.modalController.dismiss();
  }
  getPettyCashData(){
    if (this.pettyCashId) {
      this.pettyCashService
      .getPettyCash(this.pettyCashId)
      .subscribe(
        pettyCash => {
          this.pettyCash.amount = pettyCash.amount;
          this.pettyCash.category = pettyCash.category;
          this.pettyCash.otherCategory = pettyCash.otherCategory;
          this.pettyCash.description = pettyCash.description;

          if (pettyCash.defendant) {
            this.pettyCash.defendantId = pettyCash.defendant._id;
            this.getDefendants(`${pettyCash.defendant.name.first} ${pettyCash.defendant.name.last}`, pettyCash.bondId)
          }
          
         
        },
        err => {
         
        }
      )
    }
  }

  uploadFiles(){

    if(this.files.length <= 0){
      this.savePettyCash();
      return;
    }

  
    let formData = new FormData();
    this.files.forEach(file => {
      formData.append('files', file);
    })
    
    this.receiptService
    .uploadFiles(formData)
    .subscribe(
      res => {
        this.files = [];
        this.savePettyCash(res);
      },
      errors => {
      }
    )
  }
 async validate() {

    this.errors = [];
    if (this.pettyCash.category === 'Jail Receipt' && !this.pettyCash.defendantId) {
     
      this.errors.push('Please fill all required fields.');
    }

    if (this.pettyCashForm.invalid) {
      Object.keys(this.pettyCashForm.controls).forEach(key => {
        this.pettyCashForm.controls[key].markAsTouched();
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
 async savePettyCash(filesResponse = undefined){
    if(!await this.validate()){
      return;
    }

    let data = {
      agencyId: this.userStore.getUser().agencyId,
      officeId: this.userStore.getUser().office._id,
      issuedToUserId: this.staffMemberId,
      amount: this.pettyCash.amount,
      description: this.pettyCash.description,
      category: this.pettyCash.category,
      otherCategory: this.pettyCash.otherCategory,
      defendantId: this.pettyCash.defendantId,
      bondId: this.pettyCash.bondId,
      status: 'spent',
      files: filesResponse,
      receiptName: this.document.name,
      receiptId: this.jailReceipt ? this.jailReceipt._id : undefined
    };

    if (this.pettyCashId) {
      this.updatePettyCash(data);
    }
    else{
      this.addPettyCash(data);
    }
  }
  async addPettyCash(data){
    const loading = await this.loadingController.create();
    await loading.present();
    this.pettyCashService
    .addPettyCash(data)
    .subscribe(
     async cash => {
        this.pettyCashService.pettyCashAdded();
        await loading.dismiss();
        this.closeModal();
      

      },
     async errors => {
        await loading.dismiss();
        //this.closeModal();
      }
    )
  }

async updatePettyCash(data){
    const loading = await this.loadingController.create();
    await loading.present();
    this.pettyCashService
    .updatePettyCash(this.pettyCashId, data)
    .subscribe(
     async cash => {
        this.pettyCashService.pettyCashAdded();
        await loading.dismiss();
        this.closeModal();
      },
     async errors => {
        await loading.dismiss();

      }
    )
  }
  

  async openFile(file){
    const loading = await this.loadingController.create({
      message: 'Loading...'
    });
    await loading.present();
    this.receiptsService
    .getPresignedUrl({
      key: file.filename
    })
    .subscribe(
      async res => {
        
        if (file.extension === "pdf") {
          this.externalPdfViewer.pdfSrc = encodeURIComponent(res.url); // pdfSrc can be Blob or Uint8Array
          this.externalPdfViewer.refresh();
          await loading.dismiss(); // Ask pdf viewer to load/reresh pdf
        } else {
          window.open(res.url, "_blank");
          await loading.dismiss();
        }
       
      },
      async err => {
        await loading.dismiss();
      }
    )
  }


  onFileChange(event){
    for (const [key, value] of Object.entries(event.target.files)) {
      this.files.push(value);
    }
  }
  onBondIdChange(){
    if (this.pettyCash.category === 'Jail Receipt') {
      this.getBondJailReceipt();
    }
  }
  getBondJailReceipt(){
    this.receiptService.getReceipts({
      bondId: this.pettyCash.bondId,
      type: 'Jail Receipt'
    })
    .subscribe(receipts => {
      this.jailReceipt = receipts.data.length > 0 ? receipts.data[0] : undefined;
      
    })
  }

  onDefSearch(event: {
    component: IonicSelectableComponent,
    text: string,
  }) {
    // event.component.searchText = '';
    // this.defendants = []
    //this.pettyCash.defendantId = undefined
    if(event.text.length > 2) {
      event.component.startSearch();
      setTimeout(() => {
      this.getDefendants(event.text)
      event.component.endSearch();
    }, 500)
    }
  }
  
  
  medClicked(def){
   this.pettyCash.defendantId = def.value._id
  this.onDefendantChange()

  }
  getDefendants(keyword, bondId = undefined){
    let arr = []

    this.defService.getDefendants({
      agencyId: this.userStore.getUser().agencyId,
      name: keyword,
      sortBy: 'name',
      orderBy: 'ASC',
      pageNumber: 1,
      pageSize: 50,
      project: {
        _id: 1,
        name: 1,
        "bonds._id": 1,
        "bonds.bondNumber": 1,
        "bonds.power.number": 1,
        "bonds.power.prefix": 1,
      }
    })
    .subscribe(defs => {
       defs.data.forEach(element => {
        let obj = {
          _id: element._id,
          name: element.name.first + " " + element.name.last,
          bonds: element.bonds
        }
        arr.push(obj)
        
      });
    
      this.defendants = arr;

      if (bondId) {
        this.pettyCash.bondId = bondId;
        this.onDefendantChange();
      }
    },
    err => { 
      
    })
  }
  onDefendantChange(){
    const def = _.find(this.defendants, def => {
      return def._id === this.pettyCash.defendantId;
    });

    if (def) {
      this.bonds = def.bonds ? def.bonds : [];
    }
  }

}
