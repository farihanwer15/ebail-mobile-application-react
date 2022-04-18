import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { Plugins, CameraResultType, CameraSource } from '@capacitor/core';
import { ViewerModalComponent } from 'ngx-ionic-image-viewer';
import { NgForm } from '@angular/forms';
import { LoadingController, ModalController, ToastController } from '@ionic/angular';
import { UserStore } from 'src/app/@store/user.store';
import { DefendantsService } from 'src/app/services/defendants.service';
import { ReceiptsService } from 'src/app/services/receipts.service';
import { Photo, PhotoService } from '../../services/photo.service';
import { ImageCropService } from '../../services/image-crop-service';
const { Camera } = Plugins;
@Component({
  selector: 'app-defendant-document-form',
  templateUrl: './defendant-document-form.component.html',
  styleUrls: ['./defendant-document-form.component.scss'],
})
export class DefendantDocumentFormComponent implements OnInit {

  @ViewChild('documentForm', { static: false }) documentForm: NgForm;
  @ViewChild("externalPdfViewer", { static: true }) externalPdfViewer;
  @Input() defendantId;
  @Input() bondId;

  document = {
    name: undefined,
    type: undefined,
    bondId: undefined
  };
  uploadedDocument;
  isPdfFile = false;

  bonds = []

  files = [];
  errors = [];
  image = '';

  constructor(
    private userStore: UserStore,
    private receiptService: ReceiptsService,
    private toastController: ToastController,
    private defService: DefendantsService,
    private loadingController: LoadingController,
    private modalController: ModalController,
    private imageCropModalService: ImageCropService,
    public photoService: PhotoService,
  ) { }

  ngOnInit() {
    this.getDefendant();
  }

  getDefendant() {
    if (this.defendantId) {
      this.defService.getDefendant(this.defendantId)
        .subscribe(def => {
          this.bonds = def.bonds ? def.bonds : [];
        })
    }
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
        this.isPdfFile = false
        const file = this.dataURLtoFile(result, type + '-' + new Date().getTime().toString() + '.jpg');
        this.uploadFiles(file);
        console.log("file", file);
      })
      .catch(error => {
        // Handle any errors thrown
        console.log(error);
      })

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

    let formData: any = new FormData();
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
  //for multiple
  // onFileChange(event){
  //   for (const [key, value] of Object.entries(event.target.files)) {
  //     this.files.push(value);
  //   }
  // }

  async validate() {
    this.errors = [];
    let error = undefined;
    if (this.documentForm.invalid) {
      Object.keys(this.documentForm.controls).forEach(key => {
        this.documentForm.controls[key].markAsTouched();
      });
      error = 'Please fill all required fields.';
    }


    if (error) {

      const toast = await this.toastController.create({
        color: 'danger',
        duration: 3000,
        message: error,
        showCloseButton: true,
        position: 'top'
      });

      await toast.present();

      return false;
    }
    return true;
  }



  async saveReceipt() {

    if (!await this.validate()) {
      return;
    }
    const loading = await this.loadingController.create({
      message: 'Saving...'
    });
    await loading.present();

    let bondId = this.document.bondId;
    if (!bondId) {
      bondId = this.bondId;
    }

    this.receiptService
      .addReceipt({
        defendantId: this.defendantId,
        files: this.uploadedDocument,
        name: this.document.name,
        type: this.document.type,
        bondId: this.bondId,
        document: true,
        uploadedByUserId: this.userStore.getUser().id
      })
      .subscribe(
        async receipt => {
          await loading.dismiss();
          const toast = await this.toastController.create({
            color: 'success',
            duration: 3000,
            message: 'Document has been uploaded successfully..',
            showCloseButton: true,
            position: 'top'
          });
          await toast.present()
          this.closeModal();
        },
        async errors => {
          await loading.dismiss();
        }
      )
  }

  async closeModal() {
    await this.modalController.dismiss();
  }

  showActionSheet() {

  }

}