import { Component,ChangeDetectionStrategy, OnInit, Input,NgModule, Output, EventEmitter, AfterViewInit } from '@angular/core';
import {IonicModule, ModalController} from '@ionic/angular';
import {ImageCroppedEvent, ImageCropperModule} from 'ngx-image-cropper';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-image-cropper',
  templateUrl: './image-cropper.component.html',
  styleUrls: ['./image-cropper.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,

})
export class ImageCropperComponent implements OnInit {
  croppedImageBase64 = '';
  /**
   * Image to be cropped as a base64 string.
   * Should be passed in from the component calling this modal.
   */
  @Input() imageBase64 = '';
  //for camera picture

  constructor(
      private modalController: ModalController
  ) { }

  ngOnInit() {
    //
  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImageBase64 = event.base64;
  }

  dismissModal(croppedImageBase64?: string) {
    this.modalController.dismiss({croppedImageBase64});
  }

}

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    ImageCropperModule,
  ],
  declarations: [ImageCropperComponent]
})
class ImageCropModalModule {
}


//   @Input() image;
//   @Output() onImageCropped = new EventEmitter();
//   croppie;

//   croppedImage;

//   constructor(
//     private loadingController: LoadingController,
//     private modalController: ModalController,
//   ) { }

//   ngOnInit() {
//     // this.initCroppie();
//   }

//   ngAfterViewInit(){
//     this.initCroppie();
//   }

//   initCroppie(){
//     // this.image = url;
//     this.croppie = new Croppie(document.getElementById('image'),{
//       viewport: { width: 250, height: 300 },
//       showZoomer: false,
//       enableResize: true,
//       enableOrientation: true,
//       mouseWheelZoom: 'ctrl'
//     });

//     this.croppie.bind({
//         url: this.image,
//     });
//   }

//   saveImage(){
//     //on button click
//     this.croppie.result('base64').then((image) => {
//         // do something with cropped blob
//       this.croppedImage = image;
//       this.onImageCropped.emit(this.croppedImage);
//       this.croppie.destroy();
//     });
//   }


// }
