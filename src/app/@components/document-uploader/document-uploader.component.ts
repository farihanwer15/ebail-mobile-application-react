import { Component, OnInit, Input,ViewChild } from '@angular/core';
import { ModalController, LoadingController, AlertController, ToastController, Platform } from '@ionic/angular';
import { CameraResultType, CameraDirection, CameraSource, Plugins } from '@capacitor/core';
const { Camera } = Plugins;
import { Photo, PhotoService } from '../../services/photo.service';
import { ViewerModalComponent } from 'ngx-ionic-image-viewer';

import { DocumentScanner, DocumentScannerOptions } from '@ionic-native/document-scanner';
// import { OCR } from '@ionic-native/ocr/ngx';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer/ngx';

// import * as Tesseract from 'tesseract.js';

// import { createWorker } from 'tesseract.js';

import { Storage } from '@ionic/storage';

import { environment } from '../../../environments/environment';
import { ReceiptsService } from 'src/app/services/receipts.service';
import { UserStore } from 'src/app/@store/user.store';
import { ImageCropService } from '../../services/image-crop-service';

@Component({
  selector: 'app-document-uploader',
  templateUrl: './document-uploader.component.html',
  styleUrls: ['./document-uploader.component.scss'],
})
export class DocumentUploaderComponent implements OnInit {
  @ViewChild("externalPdfViewer", { static: true }) externalPdfViewer;
  image;
  isPdfFile = false;
  imageUploader = false;
  apiUrl: string;

  @Input() documentType = 'Power Receipt';
  @Input() powerNumber;
  @Input() bondId;

  fileTransfer: FileTransferObject = this.transfer.create();
  uploadedDocument
  files = [];
  errors = [];

  // worker: Tesseract.Worker;
  // workerReady = false;
  // captureProgress = 0;
  // ocrResult = '';
  // extractedPowerNumber;

  constructor(
    private modalController: ModalController,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private toastController: ToastController,
    // private ocr: OCR,
    public platform: Platform,
    private transfer: FileTransfer,
    private storage: Storage,
    private receiptService: ReceiptsService,
    private userStore: UserStore,
    private imageCropModalService: ImageCropService,
    public photoService: PhotoService,

  ) {

    this.apiUrl = environment.apiUrl + '/receipts';
  }

  ngOnInit() {
    // this.loadWorker();
  }

  async closeModal(){
    await this.modalController.dismiss();
  }

  toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    if (file){
      reader.readAsDataURL(file);
    }
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });

  // async onFileChange(event){
  //   let file;
  //   for (const [key, value] of Object.entries(event.target.files)) {
  //     file = value;
  //     this.files.push(file)
  //   }
  //   ///
  //   this.image = await this.toBase64(this.files[0]);
  //   // const reader = new FileReader();
  //   // const self = this;
  //   // reader.addEventListener('load', function() {
  //   //   self.image = this.result;
  //   // });

  //   // let dataURL = reader.readAsDataURL(file);

  //   // reader.readAsDataURL(file);
  //   // this.recognizeImage();
  // }
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
              // this.files.forEach(file => {
              //   formData.append('files', file);
              // });
            })
            .catch(error => {
              // Handle any errors thrown
              console.log(error);
            })
        }
       
      });
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
        this.isPdfFile = false
        this.image = result;
        const file = this.dataURLtoFile(result, type + '-' + new Date().getTime().toString() + '.jpg');
        this.uploadFiles(file);
      })
      .catch(error => {
        // Handle any errors thrown
        console.log(error);
      })
  }

  async takePicture(sourceType = 1) {

    let opts: DocumentScannerOptions = {
      sourceType
    };
    DocumentScanner.scanDoc(opts)
      .then(async (image: string) => {

        if (this.documentType === 'Power Receipt') {
          // this.doOCR(image); 
        }
        else{
          this.uploadFile(image)
        }
      })
      .catch((error: any) => console.error(error));

    return;
    // const image = await Camera.getPhoto({
    //   quality: 100,
    //   allowEditing: true,
    //   resultType: CameraResultType.DataUrl,
    //   // correctOrientation: false,
    //   direction: CameraDirection.Rear,
    //   saveToGallery: true,
    //   source: CameraSource.Photos
    // });

    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri
    });

    this.image = image.dataUrl;
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


  // async recognizeImage() {
  //   const result = await this.worker.recognize(this.image);
  //   this.ocrResult = result.data.text;
  //   this.extractedPowerNumber = this.ocrResult.split(' - 1')[0].split(' ')[this.ocrResult.split(' - 1')[0].split(' ').length -1];
  //   this.extractedPowerNumber = this.extractedPowerNumber.replace(/[^0-9]/g, '');
  //   await this.worker.terminate();
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

  // onImageCropped(image){
  //   this.doOCR(image);
  // }


  // async doOCR(image) {

  //   const loading = this.loadingController.create({
  //     message: 'Processing...'
  //   });
  //   (await loading).present();

  //   this.ocr.recText(0, image)
  //   .then(async (ocrResult) => {

  //     let found = -1;
  //     ocrResult.blocks.blocktext.forEach(text => {
  //         if (found < 0) {
  //           found = text.search(this.powerNumber);
  //         }
  //     });

  //     if (found < 0) {
  //       const toast = this.toastController.create({
  //         color: 'danger',
  //         duration: 3000,
  //         message: 'Power number did not matched. Please upload the correct receipt.'
  //       });
  //       (await toast).present();
  //     }
  //     else{

  //       const toast = this.toastController.create({
  //         color: 'success',
  //         duration: 3000,
  //         message: 'Power receipt matched successfully.'
  //       });
  //       (await toast).present();

  //       this.uploadFile(image);
  //     }

  //     (await loading).dismiss();
  //   })
  //   .catch(async (error: any) => {
  //     (await loading).dismiss();
  //   });
  // }

  showImageUploader(){
    if (this.platform.is('cordova')) {
      this.takePicture(0);
    }
    this.imageUploader = true;
  }

  async uploadFile(fileURI) {

    const token = await this.storage.get('token');

    let options: FileUploadOptions = {
      fileKey: 'files',
      fileName: 'name.jpg',
      headers: {
        Authorization: 'Bearer ' + token
      }
    }

    this.fileTransfer.upload(fileURI, this.apiUrl + '/upload-files', options)
      .then((data) => {
        // success
       // this.saveReceipt(this.documentType, data);
      }, (err) => {
        // error
      })
  }

  async saveReceipt(){

    // if (this.powerNumber != this.extractedPowerNumber && this.documentType === 'Power Receipt') {
    //   const toast = await this.toastController.create({
    //     color: 'danger',
    //     duration: 3000,
    //     message: 'Power Number not matched',
    //     showCloseButton: true,
    //     position: 'top'
    //   });
    //   this.sendReceipToApi(type, filesResponse, false)
    //   return;
    // }
    // if (this.powerNumber === this.extractedPowerNumber && this.documentType === 'Power Receipt') {
    //   this.sendReceipToApi(type, filesResponse, true)
    //   return;
    // }
    this.sendReceipToApi()
  }

  async sendReceipToApi() {
    const loading = await this.loadingController.create();
    await loading.present();

    let activateBond = false

    if (this.documentType === 'Power Receipt' 
    || this.documentType === 'Jail Receipt' 
    || this.documentType === 'Appearance Bond' 
    || this.documentType === 'Rate Deviation') {
      activateBond = true
    }

    const payload = {
      bondId: this.bondId,
      files: this.uploadedDocument,
      name: this.documentType,
      type: this.documentType,
      uploadedByUserId: this.userStore.getUser().id,
      activateBond: activateBond
    }
    // if (verified !== null) {
    //   payload['verified'] = verified
    // }

    this.receiptService
      .addReceipt(payload)
      .subscribe(
        async receipt => {
          await loading.dismiss();

          const toast = this.toastController.create({
            color: 'success',
            duration: 3000,
            message: `${this.documentType} has been uploaded successfully.`
          });
         // (await toast).present();

          this.receiptService.receiptAdded(null);
          this.closeModal();
        },
        async errors => {
          await loading.dismiss();
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

}
