import { Component, NgModule, OnInit, Input } from '@angular/core';
import { Plugins, CameraResultType, CameraSource } from '@capacitor/core';
import { ImageCropService } from '../../../services/image-crop-service';
import { IonicModule, LoadingController, ModalController, ToastController } from '@ionic/angular';
import { ReceiptsService } from 'src/app/services/receipts.service';

const { Camera } = Plugins;

@Component({
  selector: 'app-defendant-doucument-form',
  templateUrl: './defendant-doucument-form.component.html',
  // styleUrls: ['./defendant-document-form.component.scss'],
})
export class DefendantDoucumentFormComponent implements OnInit {
  @Input() defendantId;
  @Input() bondId;
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
  constructor(
    private imageCropModalService: ImageCropService,
    private loadingController: LoadingController,
    private receiptService: ReceiptsService,

    
    

  ) { }

  ngOnInit() {}

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

  showActionSheet(photo, position){

  }

  saveReceipt(){

  }

  closeModal(){

  }

  processFile(event){

  }
}
