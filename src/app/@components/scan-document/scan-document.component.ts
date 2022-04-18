import { CommonModule } from '@angular/common';
import { Component,ViewChild, NgModule, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { AlertController, IonicModule, LoadingController, ModalController, ToastController } from '@ionic/angular';

import { Photo, PhotoService } from '../../services/photo.service';
import { ActionSheetController } from '@ionic/angular';

// import * as Tesseract from 'tesseract.js';
// import { createWorker } from 'tesseract.js';
import { Plugins, CameraResultType, CameraSource } from '@capacitor/core';
import { ImageCropService } from '../../services/image-crop-service';
import { ReceiptsService } from 'src/app/services/receipts.service';
import { DefendantsService } from 'src/app/services/defendants.service';
import { ViewerModalComponent } from 'ngx-ionic-image-viewer';
import { UserStore } from 'src/app/@store/user.store';
import { DefendantUploadDocumentFormComponent } from '../bond/defendant-upload-document-form/defendant-upload-document-form.component'
const { Camera } = Plugins;
import { Platform } from '@ionic/angular';


@Component({
  selector: 'app-scan-document',
  templateUrl: './scan-document.component.html',
  styleUrls: ['./scan-document.component.scss'],
})
export class ScanDocumentComponent implements OnInit {
  @Input() defendantId;
  @Input() bondId;
  @ViewChild("externalPdfViewer", { static: true }) externalPdfViewer;

  files = [];
  documents = [];
  spinner: Boolean = false;
  errors = [];
  // worker: Tesseract.Worker;
  workerReady = false;
  // image = '../../assets/receipt.jpg';
  image = '';
  ocrResult = '';
  captureProgress = 0;
  bonds = [];
  segment = 'document-list';
  document = {
    templateId: undefined,
    name: undefined,
    type: undefined,
    bondId: undefined
  };

  template = {
    id: undefined,
    bondId: undefined
  }
  uploadedDocument;
  photo;
  position;
  isIos = false

  constructor(
    private modalController: ModalController,
    public photoService: PhotoService,
    public actionSheetController: ActionSheetController,
    private loadingController: LoadingController,
    private receiptService: ReceiptsService,
    private imageCropModalService: ImageCropService,
    private userStore: UserStore,
    private defService: DefendantsService,
    private alertController: AlertController,
    public toastController: ToastController,
    private cdRef: ChangeDetectorRef,
    public platform: Platform
    ) {
    // this.loadWorker();
  }

  ngOnInit() {
    if(this.platform.is('ios')){
     this.isIos = true
     } 
    this.getDefendant()
    this.getDocuments()
  }


  async getDocuments() {
    const loading = await this.loadingController.create({
      message: 'Loading...'
    });
    await loading.present();
    if (this.defendantId) {
      this.receiptService
        .getReceipts({
          document: {
            $exists: true
          },
          defendantId: this.defendantId,
          sortBy: 'createdAt',
          orderBy: 'ASC'
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

  getDefendant() {
    if (this.defendantId) {
      this.defService.getDefendant(this.defendantId)
        .subscribe(def => {
          this.bonds = def.bonds ? def.bonds : [];
        })
    }
  }

  dataURLtoFile(dataurl, filename) {

    let arr = dataurl.split(','),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mime });
  }

  async captureImage(type: string) {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: true,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera
    });
    this.image = image.dataUrl;

    this.imageCropModalService.show(this.image)
      .then(result => {
        this.image = result;
        const file = this.dataURLtoFile(result, type + '-' + new Date().getTime().toString() + '.jpg');
        this.uploadFiles(file);
      })
      .catch(error => {
        // Handle any errors thrown
        console.log(error);
      })

  }


  async uploadFiles(file) {

    this.errors = [];
    if (!file) {
      this.errors.push('Please select atleast 1 file');
    }

    if (this.errors.length > 0) {
      return;
    }

    const loading = await this.loadingController.create();
    await loading.present();

    let formData = new FormData();
    formData.append('files', file);

    // this.files.forEach(file => {
    //   formData.append('files', file);
    // });

    this.receiptService
      .uploadFiles(formData)
      .subscribe(
        async res => {
          this.uploadedDocument = res
          this.files = [];
          loading.dismiss();

          // this.saveReceipt(this.document, res);
        },
        async errors => {
          loading.dismiss();
        }
      )
  }

  saveReceipt() {
    // this.spinner = true;
    const payload = {
      defendantId: this.defendantId,
      files: this.uploadedDocument,
      name: this.document.name,
      type: this.document.type,
      bondId: this.document.bondId,
      document: true,
      uploadedByUserId: this.userStore.getUser().id
    };
    this.receiptService
      .addReceipt(payload)
      .subscribe(
       async receipt => {
          this.spinner = false;
          // this.toastrService.show('', `Document has been uploaded successfully.`, {
          //   status: 'success'
          // });
          this.getDocuments();
          this.image = null
          this.document = {
            templateId: undefined,
            name: undefined,
            type: undefined,
            bondId: undefined
          };
          const toast = await this.toastController.create({
            color: 'success',
            duration: 3000,
            message: 'Uploaded Successfully!',
            showCloseButton: true,
            position: 'bottom'
          });
          await toast.present();
        },
        errors => {
          this.spinner = false;
        }
      )
  }
  async uploadDocumentFormModal() {
    const modal = await this.modalController.create({
      component: DefendantUploadDocumentFormComponent,
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
  // async recognizeImage() {
  //   const result = await this.worker.recognize(this.image);
  //   this.ocrResult = result.data.text;
  // }

  // async loadWorker() {
  //   this.worker = createWorker({
  //     logger: progress => {
  //       if (progress.status == 'recognizing text') {
  //         this.captureProgress = parseInt('' + progress.progress * 100);
  //       }
  //     }
  //   });
  //   await this.worker.load();
  //   await this.worker.loadLanguage('eng');
  //   await this.worker.initialize('eng');
  //   this.workerReady = true;
  // }

  addPhotoToGallery() {
    this.photoService.addNewToGallery();
  }

  processFile($event: Event) {
    this.photoService.handleImageSelection($event)
      .subscribe(imageBase64 => {

        this.imageCropModalService.show(imageBase64)
          .then(result => {
            this.image = result;

            const file = this.dataURLtoFile(result, new Date().getTime().toString() + '.jpg');
            this.uploadFiles(file);
            // this.files.forEach(file => {
            //   formData.append('files', file);
            // });
          })
          .catch(error => {
            // Handle any errors thrown
            console.log(error);
          })
      });
  }

  public async showActionSheet(photo: Photo, position: number) {
    const actionSheet = await this.actionSheetController.create({
      header: 'Photos',
      buttons: [{
        text: 'Delete',
        role: 'destructive',
        icon: 'trash',
        handler: () => {
          this.photoService.deletePicture(photo, position);
        }
      },
      {
        text: 'View',
        role: 'View',
        icon: 'eye',
        handler: () => {
        }
      },
      {
        text: 'Cancel',
        icon: 'close',
        role: 'cancel',
        handler: () => {
          // Nothing to do, action sheet is automatically closed
        }
      }]
    });
    await actionSheet.present();
  }

  segmentChanged(segment) {
    this.segment = segment.detail.value;
  }
  async closeModal() {
    await this.modalController.dismiss();
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
      })
  }
  async openFile(file, download?: boolean){
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
          this.externalPdfViewer.refresh();
          await loading.dismiss(); // Ask pdf viewer to load/reresh pdf
        } else {
           if(download) {
            window.open(res.url);
          }else{
            this.viewImage({ url: res.url , name: file.name})
          }
          await loading.dismiss();
        }
      })
  }

  async presentActionSheet(file) {
    let actionButtons: any = [
      {
        text: (file.files[0].extension === 'pdf' ? 'View Document' : 'View Image'),
        handler: () => {
          this.openFile({...file.files[0], name: file.name})
        },
      },
    ];

      actionButtons.push({
        text: 'Download',
        handler: () => {
          this.downloadFile(file.files[0])  
        },
      })
    
    actionButtons.push({
      text: 'Delete',
      role: 'destructive',
      handler: () => {
        this.deleteDocument(file._id)
      },
    })

    const actionSheet = await this.actionSheetController.create({
      header: 'Options',
      buttons: actionButtons
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
    this.cdRef.detectChanges();
    return await modal.present();
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

}

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
  ],
  declarations: [ScanDocumentComponent]
})
class ScanModalModule {
}