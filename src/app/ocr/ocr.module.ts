import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { OcrPageRoutingModule } from './ocr-routing.module';
import { ImageCropperModule } from 'ngx-image-cropper';

import { OcrPage } from './ocr.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    OcrPageRoutingModule,
    ImageCropperModule
  ],
  declarations: [OcrPage]
})
export class OcrPageModule {}
