import { Component, Input, Output, EventEmitter, RendererFactory2, OnInit, ViewChild,Inject,Renderer2 } from "@angular/core";

import { Router } from '@angular/router';
import { ModalController, ToastController,LoadingController, ActionSheetController,AlertController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { UserStore } from "src/app/@store/user.store";
import { BondContractsService } from '../../../services/bond-contracts.service';
import { BondsService } from '../../../services/bonds.service';
import {ContractFormComponent} from '../contract-form/contract-form.component'
import { environment } from '../../../../environments/environment';
import { AppService } from '../../../services/app.service';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-contract-list',
  templateUrl: './contract-list.component.html',
  styleUrls: ['./contract-list.component.scss'],
})
export class ContractListComponent implements OnInit {

  @ViewChild("externalPdfViewer", { static: true }) externalPdfViewer;
  
  @Input() bondId;
  @Input() defendantId;
  @Input() manualContracts = [];
  @Output() closeModal: EventEmitter<any> = new EventEmitter();

  contracts = [];
  spinner = false;
  darkMode = true;
  renderer: Renderer2;
  subs = new Subscription();
  constructor(
    private bondService: BondsService,
    private contractService: BondContractsService,
    public alertController: AlertController,
    private modalController: ModalController,
    public userStore: UserStore,
    public actionSheetController: ActionSheetController,
    private toastController: ToastController,
    private loadingController: LoadingController,
    private appService: AppService,
    private rendererFactory : RendererFactory2,

    @Inject(DOCUMENT)
    private document:Document,
    private router: Router,
  ) {
    this.renderer = this.rendererFactory.createRenderer(null, null)
  }

  ngOnInit() {
    this.initEvents();
    this.getBondContracts();
    this.appService.getDarkMode().subscribe(res => {
      if (res) {
        this.darkMode = true;
        this.renderer.addClass(this.document.body, 'dark-theme')
      } else {
        this.renderer.removeClass(this.document.body, 'dark-theme')
        this.darkMode = false;
      }
    })
  }

  signDocument(contract, partyIndex) {
    this.closeModal.emit({})
    this.router.navigate([
      `sign-document/${contract._id}/${partyIndex}`,
    ]);
  }
  initEvents(){
    this.subs.add(
      this.contractService.refreshContracts$
      .subscribe(() => {
        this.getBondContracts();
      })
    );

    this.subs.add(
      this.contractService.refreshContracts$
      .subscribe(() => {
       
      })
    );
  }

  
  async openSentActionSheet(contractId){
    const actionSheet = await this.actionSheetController.create({
      header: 'Contracts',
      cssClass: 'my-custom-class',
      buttons: [
        {
          text: 'View Contract',
          handler: () => {
            this.viewContract(contractId);
          }
        },
        
      {
        text: 'Sync',
        handler: () => {
          this.syncContract(contractId);
        }
      }, 
      this.showDeleteButton(contractId) ? {
        text: 'Delete',
        role: 'destructive',
        handler: () => {
          this.deleteContract(contractId._id);
        }
      } : '', 
      {
        text: 'Cancel',
        role: 'cancel',
      }]
    });
    await actionSheet.present();
  }
  viewContract(contract) {
    let url = `https://www.esigngenie.com/esign/api/folders/document/download?folderId=${contract.folderId}&docNumber=1&access_token=${environment.esignAccessToken}`;
    
    this.externalPdfViewer.pdfSrc = encodeURIComponent(url); // pdfSrc can be Blob or Uint8Array
    this.externalPdfViewer.refresh(); // Ask pdf viewer to load/reresh pdf
    // window.open(url, "_blank");
  }
  async openActionSheet(contractId){
    const actionSheet = await this.actionSheetController.create({
      header: 'Contracts',
      cssClass: 'my-custom-class',
      buttons: [{
        text: 'Delete',
        role: 'destructive',
        icon: 'trash',
        handler: () => {
          this.deleteContract(contractId);
        }
      }, 
      {
        text: 'Edit',
        icon: 'create',
        handler: () => {
          this.openContractFormModal(contractId);
        }
      }, 
      {
        text: 'Cancel',
        icon: 'close',
        role: 'cancel',
      }]
    });
    await actionSheet.present();
  }

  getBondContracts(){
    if (this.bondId) {
      this.spinner = true;
      this.contractService
        .getContracts({
          bondId: this.bondId,
        })
        .subscribe(
          (contracts) => {
            this.contracts = contracts.data;
          },
          (errors) => {
            this.spinner = false;
          
          }
        );
    }
  }

  async openContractFormModal(contractId){

    const modal = this.modalController.create({
      component:ContractFormComponent,
      componentProps: {
        bondId: this.bondId,
        defendantId:this.defendantId,
        contractId : contractId,
        send: true

      }
    });

    (await modal).present();

  }

  
 async syncContract(contractId) {
    const loading = await this.loadingController.create();
    await loading.present();
    this.contractService.syncContract(contractId._id)
    .subscribe(
    async res => {
        this.getBondContracts()
        const toast = await this.toastController.create({
          color: 'success',
          duration: 3000,
          message: 'Bond Contract sync successfully.',
          showCloseButton: true,
          position: 'top'
        });
        await toast.present();
        await loading.dismiss();
        this.spinner = false;
      },
      async error => {
      
        await loading.dismiss();
      }
    );
  }

  showDeleteButton(contract) {
    let count = 0;
    for (let i = 0; i < contract.parties.length; i++) {
      const party = contract.parties[i];
      if (party.signatureStatus === "signed") {
        count++;
      }
    }

    if (count === contract.parties.length) {
      return false;
    }
    return true;
  }

 async deleteContract(contractId) {
    const alert = await this.alertController.create({
      header: 'Confirm!',
      message: 'Are you sure you want to delete this contract?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
        }, 
        {
          text: 'Yes',
          handler: async () => {
            const loading = await this.loadingController.create();
            await loading.present();
        
            this.contractService.deleteContract(contractId).subscribe(
              async res=> {
                const toast = await this.toastController.create({
                  color: 'success',
                  duration: 3000,
                  message: 'Bond Contract has been delete successfully.',
                  showCloseButton: true,
                  position: 'top'
                });
                await toast.present();
                await loading.dismiss();
                this.getBondContracts();
              },
              async err => {
                this.spinner = false;
                await loading.dismiss();
              }
            );
          
            
            
          }
        }
      ]
    });
    await alert.present();
  }
      
  

 async sendContractLink(contractId, partyId) {
    const loading = await this.loadingController.create();
    await loading.present();

    this.contractService
      .resendContractLink({
        contractId,
        partyId,
        agencyId: this.userStore.getUser().agencyId,
      })
      .subscribe(
        async res => {
          const toast = await this.toastController.create({
            color: 'success',
            duration: 3000,
            message: 'Bond Contract link send successfully.',
            showCloseButton: true,
            position: 'top'
          });
          await toast.present();
          await loading.dismiss();
        },
      async errors => {
        await loading.dismiss();
          this.spinner = false;
        }
      );
  }


  // signDocument(contract, partyIndex) {
  //   this.router.navigate([
  //     `/pages/sign-contract/${contract._id}/${partyIndex}`,
  //   ]);
  // }
  
  ngOnDestroy(){
    this.subs.unsubscribe();
  }

}
