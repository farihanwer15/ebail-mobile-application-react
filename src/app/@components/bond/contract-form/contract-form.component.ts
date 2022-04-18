import { Component,ViewChild, OnInit,Input, ChangeDetectorRef } from '@angular/core';
import { ToastController, ModalController, LoadingController } from '@ionic/angular';
import { BondsService } from '../../../services/bonds.service';
import { SuretyService } from '../../../services/surety.service';
import { NgForm } from '@angular/forms';

import * as _ from 'lodash';
import { Subscription } from 'rxjs';
import { BondContractsService } from '../../../services/bond-contracts.service';
import { UserStore } from "src/app/@store/user.store";
import { DragulaService } from 'ng2-dragula';

@Component({
  selector: 'app-contract-form',
  templateUrl: './contract-form.component.html',
  styleUrls: ['./contract-form.component.scss'],
})
export class ContractFormComponent implements OnInit {
  @ViewChild('contractForm', { static: false }) contractForm: NgForm;
  @Input() bondId;
  @Input() defendantId;
  @Input() contractId;
  @Input() send = false;

  errors = [];

  defIndemnitors = [];
  bondIndemnitors = [];
  filingAgent = undefined;
  templates = [];
  templateId = undefined;
  public selectedTemplate = undefined;
  sendSMS = false;
  sendEmail = true;
  suretyError = false;

  subs = new Subscription();
  allowSMS = false;
  constructor(
    private modalController: ModalController,
    private suretyService: SuretyService,
    private bondService: BondsService,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private contractService: BondContractsService,
    private userStore: UserStore,
    private dragulaService: DragulaService,
    private cdRef: ChangeDetectorRef,
    ) {
      dragulaService.createGroup('CONTRACT_INDEMNITORS', {
        accepts: (el, target, source, siblings) => {
  
          if (el.getAttribute('data-has-email') == 'false') {
            return false
          }
  
          if (this.bondIndemnitors.length >= (this.selectedTemplate && this.selectedTemplate.totalIndemsPerContract) && source.getAttribute('id') === 'def-indemnitors') {
            return false
          }
          return true
          
        }
      });
    }

  ngOnInit() {
    this.allowSMS = this.userStore.getAgency().enableContractSMS;
    this.getBond();
    this.getContract();

  }
  validate(): Boolean{
    
    this.errors = [];

    if (this.contractForm.invalid) {
      Object.keys(this.contractForm.controls).forEach(key => {
        this.contractForm.controls[key].markAsTouched();
      });
      this.errors.push('Please fill all required fields.');
      return;
    }
    
    if(this.errors.length > 0){
      return false;
    }
    return true;
  }
  
  getContract(){
    if (this.contractId) {
      this.contractService.getContract(this.contractId)
      .subscribe(
        contract=> {
          if (contract.structure) {
            this.bondIndemnitors = contract.structure.parties;
            _.remove(this.bondIndemnitors, indem => {
              return indem.role === 'agent';
            });
          }
          this.sendEmail = contract.sendEmail;
          this.sendSMS = contract.sendSMS;
          
          this.templateId = contract.templateId;
          this.onTemplateChange();
        }
      )
    }
  }

 async getBond(){
    if (this.bondId) {
      const loading = await this.loadingController.create();
      await loading.present();
  
      this.bondService
      .getBond(this.bondId)
      .subscribe(
       async def => {
        await loading.dismiss();
          this.defIndemnitors = [{
            _id: def._id,
            name: def.name,
            email: def.email,
            contacts: def.contacts,
            relation: 'Self'
          }]

          this.defIndemnitors = def.indemnitors ? this.defIndemnitors.concat(def.indemnitors) : this.defIndemnitors;
          const bond = def.bonds;          
          this.filingAgent = bond.filingAgent ? bond.filingAgent : undefined;
          let suretyId = undefined

          if (bond.power && bond.power.surety ) {
            suretyId = bond.power.surety._id;
          }
          else if (bond.tempSurety){
            suretyId = bond.tempSurety._id;
          }
          else if (bond.cashSurety){
            suretyId = bond.cashSurety._id;
          }

          if (suretyId) {
            console.log('surety', suretyId)
            this.getSurety(suretyId)
          }
          else{
            this.suretyError = true;
            const toast = await this.toastController.create({
              color: 'danger',
  
              message: ' Please select a surety on step 1.',
              showCloseButton: true,
              position: 'top'
            });
      
            await toast.present();
      
          }
          
          if (this.contractId && this.bondIndemnitors.length > 0) {
            this.bondIndemnitors.forEach(bIndem => {
              _.remove(this.defIndemnitors, indem => {
                return indem._id === bIndem._id;
              })
            })
          }

         
        },
       async err => {
          await loading.dismiss();
          
        }
      )    
    }
  }

async  getSurety(suretyId){
    if (suretyId) {
      this.suretyService.getSurety(suretyId)
      .subscribe(
        async surety => {
          if(surety.contractTemplates&& surety.contractTemplates.length > 0){
          this.templates = surety.contractTemplates ? surety.contractTemplates : []
          this.templateId = !this.templateId && this.templates.length > 0 ? this.templates[0].templateId : this.templateId;
          
          this.onTemplateChange();
          }else{
            this.suretyError = true;
            const toast = await this.toastController.create({
              color: 'danger',
  
              message: 'The selected surety does not have any contract template',
              showCloseButton: true,
              position: 'top'
            });
      
            await toast.present();

          }
        }
      )
    }
  }

  onTemplateChange(){
    this.selectedTemplate = _.find(this.templates, template => {
      return template.templateId === this.templateId;
    });
    this.cdRef.detectChanges();
  }
  sendContract(){
    this.saveContract(true);
  }

  saveContract(generate = undefined){
    if(!this.validate()){
      return;
    }
    this.filingAgent.role = 'agent'
    let parties = [this.filingAgent];
    parties = parties.concat(this.bondIndemnitors);
    
    let data = {
      agencyId: this.userStore.getUser().agencyId,
      bondId: this.bondId,
      defendantId: this.defendantId, 
      templateId: this.templateId,
      structure: {
        parties: parties,
      },
      sendSMS: this.sendSMS,
      sendEmail: this.sendEmail,
      status: 'Draft',
      generateContract: generate

    }

    if (this.contractId) {
      this.updateContract(data)
    }
    else{
      this.addContract(data);
    }

  }

 async addContract(data){
    const loading = await this.loadingController.create();
    await loading.present();
    this.contractService.addContract(data)
    .subscribe(
     async res => {
      const toast = await this.toastController.create({
        color: 'success',
        duration: 3000,
        message: 'Bond Contract has been added successfully.',
        showCloseButton: true,
        position: 'top'
      });
        this.contractService.refreshContracts();
        this.contractService.contractAdded()
        await loading.dismiss();
        await toast.present();
        this.closeModal();
      },
     async err => {
        await loading.dismiss();
       
      }
    )
  }
  
async updateContract(data){
    const loading = await this.loadingController.create();
    await loading.present();
    this.contractService.updateContract(this.contractId, data)
    .subscribe(
     async res => {
      const toast = await this.toastController.create({
        color: 'success',
        duration: 3000,
        message: 'Bond Contract has been updated successfully.',
        showCloseButton: true,
        position: 'top'
      });
        this.contractService.refreshContracts();
        this.contractService.contractAdded()
        this.closeModal();
        await loading.dismiss();
      },
     async err => {
        await loading.dismiss();
        
      }
    )
  }

  async closeModal(){
    await this.modalController.dismiss();
  }
  ngOnDestroy(){
    this.subs.unsubscribe();
    this.dragulaService.destroy('CONTRACT_INDEMNITORS')
  }

}
