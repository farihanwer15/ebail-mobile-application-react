import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { BondContractsService } from 'src/app/services/bond-contracts.service';
import { Router } from '@angular/router';
import { ActionSheetController, AlertController, LoadingController, ModalController, ToastController } from '@ionic/angular';

import * as _ from 'lodash';
import { NgForm } from '@angular/forms';
import { ReceiptsService } from 'src/app/services/receipts.service';
import { BondsService } from 'src/app/services/bonds.service';
import { async } from '@angular/core/testing';
import { UserStore } from 'src/app/@store/user.store';
import { environment } from '../../../../environments/environment';
import { ContractFormComponent } from '../../../@components/bond/contract-form/contract-form.component';
import { Photo, PhotoService } from '../../../services/photo.service';
import { ImageCropService } from '../../../services/image-crop-service';
import { Platform } from '@ionic/angular';
import { ViewerModalComponent } from 'ngx-ionic-image-viewer';

@Component({
  selector: 'app-bond-contracts',
  templateUrl: './bond-contracts.component.html',
  styleUrls: ['./bond-contracts.component.scss'],
})
export class BondContractsComponent implements OnInit {

  @ViewChild('documentForm', { static: false }) documentForm: NgForm;
  @ViewChild("externalPdfViewer", { static: true }) externalPdfViewer;
  @Output() public closeModal: EventEmitter<any> = new EventEmitter();

  @Input() bondId;
  defendantId = undefined;
  isIos = false
  contractForm = false;

  contracts = {
    data: [],
    meta: {}
  }
  document = {
    name: undefined,
  };
  isPdfFile = false;
  image = ''
  files = [];
  manualContracts = [];
  uploadedDocument;


  constructor(
    private contractsService: BondContractsService,
    private router: Router,
    private actionSheetController: ActionSheetController,
    private modalController: ModalController,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private receiptService: ReceiptsService,
    private bondService: BondsService,
    private userStore: UserStore,
    public photoService: PhotoService,
    private imageCropModalService: ImageCropService,
    public platform: Platform


  ) { }

  ngOnInit() {
    if(this.platform.is('ios')){
      this.isIos = true
      } 
    this.getBondContracts();
    this.getBond();
  }


  async getBondContracts() {
    if (this.bondId) {
      const loading = await this.loadingController.create({
        message: 'Please wait...'
      });
      this.contractsService
        .getContracts({
          bondId: this.bondId
        })
        .subscribe(
          async contracts => {
            await loading.dismiss();
            this.contracts = contracts;
          },
          async errors => {
            await loading.dismiss();
            console.log(errors);
          }
        )
    }
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
  async viewActionSheet(file) {
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
  async getBond() {
    if (this.bondId) {
      const loading = this.loadingController.create({
        message: 'Loading Contract Files...'
      });
      (await loading).present();

      this.bondService.getBond(this.bondId)
        .subscribe(async def => {
         
          this.defendantId = def._id;
          this.manualContracts = def.bonds.contracts ? def.bonds.contracts : [];
        

          (await loading).dismiss();
        })
      
    }
  }

  viewContract(contract) {
    let url = `https://www.esigngenie.com/esign/api/folders/document/download?folderId=${contract.folderId}&docNumber=1&access_token=${environment.esignAccessToken}`;
    this.externalPdfViewer.pdfSrc = encodeURIComponent(url); // pdfSrc can be Blob or Uint8Array
    this.externalPdfViewer.refresh();
    //window.open(url, "_blank");
  }


  signDocument(contract) {
    this.router.navigate([`sign-document/${contract._id}/0`]);
  }

  sendContractLink(contract) {

    let party = _.find(contract.parties, party => {
      return party.role === 'agent';
    });

    this.contractsService
      .resendContractLink({
        contractId: contract._id,
        partyId: party.partyId
      })
      .subscribe(
        () => {
        },
        errors => {
        }
      );
  }

  async presentActionSheet(contract) {
    const actionSheet = await this.actionSheetController.create({
      header: 'Options',
      buttons: [{
        text: 'View Contract',
        handler: () => {
          this.viewContract(contract)
        }
      },
      {
        text: 'Sign Contract',
        handler: async () => {
          await this.modalController.dismiss();
          this.signDocument(contract);
        }
      },
      {
        text: 'Send Contract Link to Indemnitor',
        handler: () => {
          this.sendContractLink(contract);
        }
      },
      {
        text: 'Delete',
        role: 'destructive',
        handler: () => {
          this.deleteContract(contract._id)
        }
      }]
    });
    await actionSheet.present();
  }

  async deleteContract(contractId) {

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
      message: 'Are you sure you want to delete this contract?',
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
            this.contractsService.deleteContract(contractId).subscribe(
              async (res) => {
                this.getBondContracts();
                await loading.dismiss();
                const toast = await this.toastController.create({
                  color: 'success',
                  duration: 3000,
                  message: 'Contract has ben deleted successfully..',
                  showCloseButton: true,
                  position: 'top'
                });
                await toast.present()
              },
              async (err) => {
                await loading.dismiss();
              }
            );

          }
        }
      ]
    });

    await alert.present();
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
  toggleContractForm() {
    this.contractForm = !this.contractForm;
  }


  onFileChange(event) {
    for (const [key, value] of Object.entries(event.target.files)) {
      this.files.push(value);
    }
  }

  async validate() {
    let error = undefined;
    if (this.documentForm.invalid) {
      Object.keys(this.documentForm.controls).forEach(key => {
        this.documentForm.controls[key].markAsTouched();
      });
      error = 'Please fill all required fields.';
    }

    if (!this.uploadedDocument) {
      error = "Please select atleast one file."
    }

    if (error) {
      const toast = await this.toastController.create({
        color: 'danger',
        duration: 3000,
        message: error,
        showCloseButton: true,
        position: 'top'
      });
      await toast.present()
      return false;
    }
    return true;
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
  async uploadFiles(file) {

  

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

 

  async saveContracts() {
    if (!await this.validate()) {
      return;
    }
      let filesResponse  = this.uploadedDocument
    const loading = await this.loadingController.create({
      message: 'Uploading...'
    });
    await loading.present();


    for (let i = 0; i < filesResponse.length; i++) {
      filesResponse[i].name = this.document.name;
    }

    this.bondService.addContractFileToBond(this.bondId, filesResponse).subscribe(
      async (res) => {
        this.bondService.bondUpdated();
        this.getBond()
        this.hideForm()
        this.isPdfFile = false
        this.image = ''

        await loading.dismiss();
      },
      async (error) => {
        console.log(error);
        await loading.dismiss();
      }
    );
  }

  async deleteContractFile(contractId) {

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
      message: 'Are you sure you want to delete this contract?',
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

            this.bondService
              .removeContractFileFromBond(this.defendantId, contractId)
              .subscribe(
                async (res) => {
                  this.getBond();
                  await loading.dismiss();
                },
                async (error) => {
                  await loading.dismiss()
                }
              );

            this.contractsService.deleteContract(contractId).subscribe(
              async (res) => {
                this.getBondContracts();
                await loading.dismiss();
                const toast = await this.toastController.create({
                  color: 'success',
                  duration: 3000,
                  message: 'Contract has ben deleted successfully..',
                  showCloseButton: true,
                  position: 'top'
                });
                await toast.present()
              },
              async (err) => {
                await loading.dismiss();
              }
            );

          }
        }
      ]
    });

    await alert.present();
  }

  hideForm() {
    this.contractForm = false;
  }

  // openFile(file) {
  //   this.receiptService.getPresignedUrl({
  //     key: file.filename
  //   }).subscribe((res) => {
  //     if (file.extension === "pdf") {
  //       this.externalPdfViewer.pdfSrc = encodeURIComponent(res.url); // pdfSrc can be Blob or Uint8Array
  //       this.externalPdfViewer.refresh(); // Ask pdf viewer to load/reresh pdf
  //     } else {
  //       window.open(res.url, "_blank");
  //     }
  //   });
  // }
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
  async presentDocActionSheet(doc) {
    const actionSheet = await this.actionSheetController.create({
      header: 'Options',
      buttons: [
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            this.deleteContractFile(doc._id)
          }
        }]
    });
    await actionSheet.present();
  }

  async openContractFormModal() {
    const modal = this.modalController.create({
      component: ContractFormComponent,
      componentProps: {
        bondId: this.bondId,
        defendantId: this.defendantId,
        send : true
      }
    });
    (await modal).present();
  }
}
