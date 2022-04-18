import { Component, OnInit,ViewChild, Input } from '@angular/core';
import { ReceiptsService } from 'src/app/services/receipts.service';

import * as _ from 'lodash';
import { AlertController, LoadingController, ToastController, ModalController } from '@ionic/angular';
import { DocumentUploaderComponent } from '../../document-uploader/document-uploader.component';
import { Subscription } from 'rxjs';
import { UserStore } from 'src/app/@store/user.store';
import { ViewerModalComponent } from 'ngx-ionic-image-viewer';
import { ActionSheetController } from '@ionic/angular';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-bond-receipts',
  templateUrl: './bond-receipts.component.html',
  styleUrls: ['./bond-receipts.component.scss'], 
})
export class BondReceiptsComponent implements OnInit {

  @Input() bondId;
  @Input() powerNumber;
  @ViewChild("externalPdfViewer", { static: true }) externalPdfViewer;

  isIos = false
  receipts = {
    data: [],
    meta: {}
  };
  spinner = false;

  powerReceipt = {
    _id: undefined,
    files: [],
    createdAt: undefined,
  };
  jailReceipt = {
    _id: undefined,
    createdAt: undefined,
    files: []
  };
  appBond = {
    _id: undefined,
    createdAt: undefined,
    files: []
  };
  rateDev = {
    _id: undefined,
    createdAt: undefined,
    files: []
  };

  files = [];
  errors = [];

  receiptAddedSubscription: Subscription;
  
  constructor(
    private receiptsService: ReceiptsService,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private modalController: ModalController,
    private userStore: UserStore,
    public actionSheetController: ActionSheetController,
    public platform: Platform

  ) { }

  ngOnInit() {
    if(this.platform.is('ios')){
      this.isIos = true
      } 
    this.getBondReceipts();
    this.initEvents();
  }

  initEvents() {
    this.receiptAddedSubscription = this.receiptsService
    .receiptAdded$
    .subscribe(() => {
      this.getBondReceipts();
    })
  }
  
  getBondReceipts(){
    this.spinner = true;
    if(this.bondId){
      this.receiptsService
      .getReceipts({
        bondId: this.bondId
      })
      .subscribe(
        receipts => {
          this.receipts = receipts;

          this.powerReceipt = this.getReceipt('Power Receipt');
          this.jailReceipt = this.getReceipt('Jail Receipt');
          this.appBond = this.getReceipt('Appearance Bond');
          this.rateDev = this.getReceipt('Rate Deviation');

          this.spinner = false;
        },
        errors => {
          this.spinner = false;
        }
      )
    }
  }

  
  getReceipt(type){
    let receipt = _.find(this.receipts.data, r => {
      return r.type === type;
    });

    return receipt ? receipt : { files: []};
  }
  
  async deleteReceipt(receiptId){

    if (this.userStore.getUser().roles.recoveryAgent && (!this.userStore.getUser().roles.generalAgent || this.userStore.getUser().roles.subAgent)) {
      const toast1 = await this.toastController.create({
        color: 'danger',
        duration: 3000,
        message: 'You dont have permission to delete this file.',
        showCloseButton: true,
        position: 'top'
      });
      await toast1.present();
      return;
    }

    const alert = await this.alertController.create({
      header: 'Confirm!',
      message: 'Are you sure you want to delete this reciept?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
        }, 
        {
          text: 'Yes',
          handler: async () => {

            const loading = await this.loadingController.create({
              message: 'Please wait...'
            });
            await loading.present();
            this.receiptsService
            .deleteReceipt(receiptId)
            .subscribe(
              async () => {
                this.getBondReceipts();
                
                const toast = await this.toastController.create({
                  color: 'success',
                  duration: 3000,
                  message: 'Receipt has been deleted successfully.',
                  showCloseButton: true,
                  position: 'top'
                });
                await toast.present();
                await loading.dismiss();
              },
              async errors => {
                console.log(errors);
                
                await loading.dismiss();
              }
            );
            
          }
        }
      ]
    });

    await alert.present();
  }

  async openDocumentUploader(type){

    const modal = this.modalController.create({
      component: DocumentUploaderComponent,
      componentProps: {
        documentType: type,
        bondId: this.bondId,
        powerNumber: this.powerNumber,
      }
    });
    
    (await modal).present();
  }

  async openFile(file, download?: boolean){
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
          if(download) {
           window.open(res.url);
         }else{
           this.viewImage({ url: res.url})
         }
         await loading.dismiss();
       }
       
      },
      async err => {
        await loading.dismiss();
      }
    )
  }
  async downloadFile(file){
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
        let a = document.createElement("a");
        document.body.appendChild(a);
        a.href = res.url;
        a.download = file.filename;
       a.click();
       document.body.removeChild(a);
        await loading.dismiss();
      },
      async err => {
        await loading.dismiss();
      }
      )
  }
  async presentActionSheet(file) {
    let actionButtons: any = [
    {
      text: (file.extension === 'pdf' ? 'View Document' : 'View Image'),
      // role: '',
      handler: () => {
        this.openFile({ ...file })
      },
    },
  ];

      actionButtons.push({
        text: 'Download',
        // role:'',
        handler: () => {
          this.downloadFile(file)
        },
      })
    
    const actionSheet = await this.actionSheetController.create({
      header: 'Options',
      buttons: actionButtons,
    });
    await actionSheet.present();
  }

  async viewImage(data) {
    const modal = await this.modalController.create({
      component: ViewerModalComponent,
      componentProps: {
        src: data.url, // required
        title: '', // optional
        text: '', // optional
      },
      cssClass: 'ion-img-viewer', // required
      keyboardClose: true,
      showBackdrop: true,
    });

    return await modal.present();
  }
}
