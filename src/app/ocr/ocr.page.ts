import { Component, OnInit } from '@angular/core';
import { Photo, PhotoService } from '../services/photo.service';
import { ActionSheetController } from '@ionic/angular';

// import * as Tesseract from 'tesseract.js';
// import { createWorker } from 'tesseract.js';
import { Plugins, CameraResultType, CameraSource } from '@capacitor/core';
import { ImageCropService } from '../services/image-crop-service';

const { Camera } = Plugins;


@Component({
  selector: 'app-ocr',
  templateUrl: './ocr.page.html',
  styleUrls: ['./ocr.page.scss'],
})
export class OcrPage implements OnInit {

  // worker: Tesseract.Worker;
  workerReady = false;
  // image = '../../assets/receipt.jpg';
  image = '';
  ocrResult = '';
  captureProgress = 0;

  constructor(
    public photoService: PhotoService,
    public actionSheetController: ActionSheetController,
    private imageCropModalService: ImageCropService,
  ) { 
    // this.loadWorker();
  }

  ngOnInit() {

  }
  async captureImage() {
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
      // Do something with the result, upload to your server maybe?
    })
    .catch(error => {
      // Handle any errors thrown
      console.log(error);
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
            // Do something with the result, upload to your server maybe?
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
}
