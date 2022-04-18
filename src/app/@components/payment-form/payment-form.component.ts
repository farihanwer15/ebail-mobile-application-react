import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { LoadingController, ModalController, ToastController } from '@ionic/angular';
import { UserStore } from 'src/app/@store/user.store';
import { InvoicesService } from 'src/app/services/invoices.service';
import { PaymentService } from 'src/app/services/payment.service';
import { PublicService } from 'src/app/services/public.service';

declare var ProxynizationAPI: any;
declare var $: any;

@Component({
  selector: 'app-payment-form',
  templateUrl: './payment-form.component.html',
  styleUrls: ['./payment-form.component.scss'],
})
export class PaymentFormComponent implements OnInit {

  @ViewChild('paymentForm', { static: false }) paymentForm: NgForm;
  @Input() invoiceId;
  @Input() amount;
  @Input() defendantId;
  @Input() source = 'agency';
  @Input() agencyId;

  spinner = false;
  error = undefined

  payment = {
    amount: undefined,
    address: {
      line1: undefined,
      city: undefined,
      state: undefined,
      zip: undefined
    },
    card: {
      name: undefined,
      accountNumber: undefined,
      accessory: undefined,
      csc: undefined
    }
  }
  
  constructor(
    private modalController: ModalController,
    private invoiceService: InvoicesService,
    private userStore: UserStore,
    private paymentService: PaymentService,
    private publicService: PublicService,
    private toastController: ToastController,
    private loadingController: LoadingController
  ) { }

  ngOnInit() {
    this.getTempPass();
    this.getInvoice();
  }
  
  getTempPass(){
    this.publicService.getZiftTempPassword({
      agencyId: this.userStore.getUser().agencyId
    })
    .subscribe(
      (password: any) => {
        ProxynizationAPI.password = password.temporaryPassword
      },
      err => {
      }
    )
  }

  getInvoice(){
    if (this.invoiceId) {
      this.spinner = true;
      this.invoiceService.getInvoice(this.invoiceId)
      .subscribe(
        invoice => {
          console.log(invoice);
          // this.status = invoice.status;
          if (invoice) {
            this.payment.amount = invoice.totalAmount;
          }
          this.spinner = false;
        },
        err => {
          this.spinner = false;
        }
      )
    }
  }

  onCardNumberBlur(){
    console.log('this.payment.card.accountNumber', this.payment.card.accountNumber);
    
    if (!this.payment.card.accountNumber) {
      return;
    }
    this.getTempPass();
    // this.process();
    process1(this.payment.card.accountNumber);
  }

  
  async validate() {

    this.error = undefined;

    if (this.paymentForm.invalid) {
      Object.keys(this.paymentForm.controls).forEach(key => {
        this.paymentForm.controls[key].markAsTouched();
      });
      this.error = 'Please fill all required fields.';
    }
    
    if(this.error){

      const toast = await this.toastController.create({
        color: 'danger',
        duration: 3000,
        message: 'Please fill all required fields.',
        showCloseButton: true,
        position: 'top'
      });

      await toast.present();

      return false;
    }
    return true;
  }

  process(){
    this.publicService.proxynization(
      this.payment.card.accountNumber, 
      ProxynizationAPI.password, 
      function(responseCode, responseMessage, proxyNumber) {
        console.log(proxyNumber);
      }
    )
    .subscribe(res => {
      console.log('res', res);
      
    })
  }
  

  async onSubmit(){
    
    if (!await this.validate()) {
      return;
    }

    this.error = undefined;

    this.payment.card.accountNumber = `*${$('#account-number').val()}`;
    let data:any = this.payment;
    data.agencyId = this.userStore.getAgency()._id;
    data.invoiceId = this.invoiceId;
    data.defendantId = this.defendantId;
    data.source = this.source;

    this.authPayment(data)
  }

  async authPayment(data){
    const loading = await this.loadingController.create({
      message: 'Please wait...',
    });
    await loading.present();

    this.paymentService.makePayment(data)
    .subscribe(
      async (res:any) => {
        if (res.responseCode === 'A01') {
          
          const toast = await this.toastController.create({
            color: 'success',
            duration: 3000,
            message: 'Payment Successfull.',
            showCloseButton: true,
            position: 'top'
          });
    
          await toast.present();
          this.closeModal();
          this.paymentService.paymentAdded(); 
        }
        else{
          this.error = `Transaction denied. Reason: ${res.responseMessage.replace(/[^a-zA-Z ]/g, " ")}`

          const toast = await this.toastController.create({
            color: 'danger',
            duration: 3000,
            message: this.error,
            showCloseButton: true,
            position: 'top'
          });
    
          await toast.present();
          
        }

        await loading.dismiss();
      },
      async err => {
        await loading.dismiss();
        console.log(err);
      }
    )
  }

  async closeModal() {
    await this.modalController.dismiss();
  }

}

function process1(cardNumber){
  console.log('Attempt 10');
    
  ProxynizationAPI.process(cardNumber, function(n,e,t){document.getElementById("account-number").setAttribute("value",t)});
}
