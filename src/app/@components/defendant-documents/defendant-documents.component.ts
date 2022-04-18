import { Component, Input, OnInit,ViewChild } from '@angular/core';
import { ActionSheetController, AlertController, LoadingController, ModalController, ToastController } from '@ionic/angular';
import { ReceiptsService } from 'src/app/services/receipts.service';
import { DefendantDocumentFormComponent } from '../defendant-document-form/defendant-document-form.component';
import { ViewerModalComponent } from 'ngx-ionic-image-viewer';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-defendant-documents',
  templateUrl: './defendant-documents.component.html',
  styleUrls: ['./defendant-documents.component.scss'],
})
export class DefendantDocumentsComponent implements OnInit {

  @Input() defendantId;
  @Input() bondId;
  @ViewChild("externalPdfViewer", { static: true }) externalPdfViewer;

  isIos = false
  documents = []

  constructor(
    private modalController: ModalController,
    private receiptService: ReceiptsService,
    private loadingController: LoadingController,
    private actionSheetController: ActionSheetController,
    private alertController: AlertController,
    private toastController: ToastController,
    public platform: Platform

  ) { }

  ngOnInit() {
    this.getDocuments();
    if(this.platform.is('ios')){
      this.isIos = true
      } 
  }

  async openDocumentForm(){
    const modal = await this.modalController.create({
      component: DefendantDocumentFormComponent,
      componentProps: {
        defendantId: this.defendantId,
        bondId: this.bondId
      },
      
    });

    await modal.present();
    modal.onDidDismiss().then(res => {
      this.getDocuments();
    })
    
  }

  async getDocuments(){
    const loading = await this.loadingController.create({
      message: 'Loading...'
    });
    await loading.present();
    if(this.defendantId){
      this.receiptService
      .getReceipts({
        document: {
          $exists: true
        },
        defendantId: this.defendantId,
        bondId: this.bondId
      })
      .subscribe(
        async documents => {
          this.documents = documents.data;
          await loading.dismiss();
        },
        async errors => {
          await loading.dismiss();
        }
      )
    }
  }
  


  async openFile(file){
    const loading = await this.loadingController.create({
      message: 'Loading...'
    });
    await loading.present();
    this.receiptService
    .getPresignedUrl({
      key: file.filename
    })
    .subscribe(
      async res => {
        if (file.extension === "pdf") {
          this.externalPdfViewer.pdfSrc = encodeURIComponent(res.url); // pdfSrc can be Blob or Uint8Array
          this.externalPdfViewer.refresh(); // Ask pdf viewer to load/reresh pdf
          await loading.dismiss();
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

  async deleteDocument(docId){
    const alert = await this.alertController.create({
      header: 'Confirm!',
      message: 'Are you sure you want to delete this document?',
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
            this.receiptService.deleteReceipt(docId)
            .subscribe(
              async () => {
                this.getDocuments();
                const toast = await this.toastController.create({
                  color: 'success',
                  duration: 3000,
                  message: 'Document has ben deleted successfully..',
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
 async ViewDoc(doc, download?: boolean){
    const loading = await this.loadingController.create({
      message: 'Loading...'
    });
    await loading.present();
    this.receiptService
    .getPresignedUrl({
      key: doc.filename
    })
    .subscribe(
      async res => {
        if (doc.extension === "pdf") {
          this.externalPdfViewer.pdfSrc = encodeURIComponent(res.url); // pdfSrc can be Blob or Uint8Array
          this.externalPdfViewer.refresh(); // Ask pdf viewer to load/reresh pdf
          await loading.dismiss();
        } else {
          if(download) {
            window.open(res.url);
          }else{
            this.viewImage({ url: res.url , name: doc.name})
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
    this.receiptService
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
  async presentActionSheet(doc) {
    const actionSheet = await this.actionSheetController.create({
      header: 'Options',
      buttons: [
        {
          text: (doc.files[0].extension === 'pdf' ? 'View Document' : 'View Image'),
          handler: () => {
            this.ViewDoc({...doc.files[0], name: doc.name})
          },
        },
        {
          text: 'Download',
          handler: () => {
            this.downloadFile(doc.files[0])
          },
        },
      {
        text: 'Delete',
        role: 'destructive',
        handler: () => {
          this.deleteDocument(doc._id)
        }
      }]
    });
    await actionSheet.present();
  }

  async viewImage(data) {
    const modal = await this.modalController.create({
      component: ViewerModalComponent,
      componentProps: {
        src: data.url, // required
        title: '', // optional
        text: data.name, // optional
      },
      cssClass: 'ion-img-viewer', // required
      keyboardClose: true,
      showBackdrop: true,
    });

    return await modal.present();
  }

}
