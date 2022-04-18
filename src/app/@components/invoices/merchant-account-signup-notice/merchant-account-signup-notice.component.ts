import { CommonModule } from '@angular/common';
import { Component, NgModule, OnInit, Input, ViewChild } from '@angular/core';
import { IonicModule, ModalController, ToastController, LoadingController } from '@ionic/angular';
import { DefendantsService } from '../../../services/defendants.service';

@Component({
  selector: 'app-merchant-account-signup-notice',
  templateUrl: './merchant-account-signup-notice.component.html',
  styleUrls: ['./merchant-account-signup-notice.component.scss'],
})
export class MerchantAccountSignupNoticeComponent implements OnInit {

  constructor(private modalController: ModalController, private defService: DefendantsService,
    public toastController: ToastController) { }

  ngOnInit() { }

  async closeModal() {
    await this.modalController.dismiss();
  }

  async sendEmail() {
    const toast = await this.toastController.create({
      color: 'success',
      duration: 3000,
      message: 'Sign up instructions have been sent successully.',
      showCloseButton: true,
      position: 'top'
    });

    await toast.present();

   // this.defService.closeMerchantSignup();
   this.closeModal()
  }


}

@NgModule({
  imports: [

    CommonModule,
    IonicModule,
  ],
  declarations: [MerchantAccountSignupNoticeComponent]
})
class MerchantAccountSignupNoticeModule {
}