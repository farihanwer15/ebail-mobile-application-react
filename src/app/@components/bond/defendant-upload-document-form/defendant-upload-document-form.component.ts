import { Component, NgModule, OnInit, Input, ViewChild } from '@angular/core';
import { Plugins, CameraResultType, CameraSource } from '@capacitor/core';
import { ImageCropService } from '../../../services/image-crop-service';
import { IonicModule, LoadingController, ModalController, ToastController } from '@ionic/angular';
import { ReceiptsService } from 'src/app/services/receipts.service';
import { Photo, PhotoService } from '../../../services/photo.service';
import { UserStore } from 'src/app/@store/user.store';
import { DefendantsService } from 'src/app/services/defendants.service';
import { Platform } from '@ionic/angular';
import { ViewerModalComponent } from 'ngx-ionic-image-viewer';

const { Camera } = Plugins;

@Component({
  selector: 'app-defendant-upload-document-form',
  templateUrl: './defendant-upload-document-form.component.html',
  styleUrls: ['./defendant-upload-document-form.component.scss'],
})
export class DefendantUploadDocumentFormComponent implements OnInit {
  @ViewChild("externalPdfViewer", { static: true }) externalPdfViewer;

  @Input() defendantId;
  @Input() bondId;
  files = [];
  documents = [];
  spinner: Boolean = false;
  errors = [];
  isPdfFile = false;

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
  constructor(
    private imageCropModalService: ImageCropService,
    private loadingController: LoadingController,
    private receiptService: ReceiptsService,
    private modalController: ModalController,
    public photoService: PhotoService,
    private userStore: UserStore,
    public toastController: ToastController,
    private defService: DefendantsService,
) { }

  ngOnInit() {
  this.getDefendantData()
  }
  async closeModal(){
    await this.modalController.dismiss();
  }

  async getDefendantData() {

    const loading = await this.loadingController.create();
    await loading.present();

    this.defService
      .getDefendant(this.defendantId)
      .subscribe(
        async def => {
          this.bonds = def.bonds ? def.bonds : [];
          await loading.dismiss();
        },
        async errors => {
          await loading.dismiss()
        }
      )
  }
  async ViewDoc(){
    if(this.uploadedDocument){
  this.receiptService
  .getPresignedUrl({
    key:this.uploadedDocument[0].filename,
  })
  .subscribe(
    async res => {
      if (this.uploadedDocument[0].extension === "pdf") {
        this.externalPdfViewer.pdfSrc = encodeURIComponent(res.url); // pdfSrc can be Blob or Uint8Array
        this.externalPdfViewer.refresh(); // Ask pdf viewer to load/reresh pdf
      }
    },
    async err => {
    }
  )
}
}
async imageView(image){
 this.viewImage({ url: image})
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
  processFile($event: Event) {
    const fileType = (<HTMLInputElement>$event.target).files[0];
    this.photoService.handleImageSelection($event)
      .subscribe(imageBase64 => {
        if (fileType.type.includes('pdf')) {
          this.isPdfFile = true
          this.image = ''
          const file = this.dataURLtoFile(imageBase64, new Date().getTime().toString() + '.pdf');
          this.uploadFiles(file);
        } else {
          this.imageCropModalService.show(imageBase64)
            .then(result => {
              this.image = result;
              this.isPdfFile = false

              const file = this.dataURLtoFile(result, new Date().getTime().toString() + '.jpg');
              this.uploadFiles(file);
            })
            .catch(error => {
              // Handle any errors thrown
              console.log(error);
            })
        }
      });
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
      .catch( async error => {
        const toast = await this.toastController.create({
          color: 'danger',
          duration: 3000,
          message: 'Image uploading failed please try agian!',
          showCloseButton: true,
          position: 'top'
        });
        await toast.present();
        // Handle any errors thrown
        console.log(error);
      })

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
          this.closeModal();
        },
        errors => {
          this.spinner = false;
        }
      )
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
          const toast = await this.toastController.create({
            color: 'danger',
            duration: 3000,
            message: 'Image uploading failed please try agian!',
            showCloseButton: true,
            position: 'top'
          });
          this.image = ''
          await toast.present();
          loading.dismiss();
        }
      )
  }

  // showActionSheet(photo, position){
    
  // }

}
