import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { ActionSheetController, AlertController, LoadingController, ModalController, ToastController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { InvoicesService } from 'src/app/services/invoices.service';
import { PaymentService } from 'src/app/services/payment.service';
import { PaymentFormComponent } from '../../payment-form/payment-form.component';

@Component({
  selector: 'app-bond-invoices',
  templateUrl: './bond-invoices.component.html',
  styleUrls: ['./bond-invoices.component.scss'],
})
export class BondInvoicesComponent implements OnInit, OnDestroy {

  @Input() bondId;

  invoices = {
    data: [],
    meta: {}
  };

  spinner = false;
  subs = new Subscription();

  constructor(
    private invoicesService: InvoicesService,
    private actionSheetController: ActionSheetController,
    private toastController: ToastController,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private modalController: ModalController,
    private paymentService: PaymentService
  ) { }

  ngOnInit() {
    this.getBondInvoices();

    this.subs.add(
      this.paymentService.paymentAdded$.subscribe(
        () => {
          this.getBondInvoices();
        }
      )
    )
  }
  
  async getBondInvoices(){
    if(this.bondId){
      const loading = await this.loadingController.create({
        message: 'Please wait...'
      });
      await loading.present();
      this.invoicesService.getInvoices({
        bondId: this.bondId,
        sortBy: 'dueDate',
        orderBy: 'ASC'
      })
      .subscribe(
        async invoices => {
          this.invoices = invoices;
          await loading.dismiss();
        },
        async errors => {
          await loading.dismiss();
        }
      )
    }
  }

  async presentActionSheet(invoice){

    let buttons = [];

    if (invoice.status === 'pending') {
      buttons.push({
        text: 'Pay Now',
        handler: () => {
          this.openPaymentForm(invoice._id)
        }
      })

      // buttons.push({
      //   text: 'Mark As Paid',
      //   handler: () => {
      //     this.payInvoice(invoice._id)
      //   }
      // })

      buttons.push({
        text: 'Delete Invoice',
        role: 'destructive',
        handler: () => {
          this.deleteInvoice(invoice._id)
        }
      })
    }

    // if (invoice.status === 'paid') {
    //   buttons.push({
    //     text: 'Void/Refund',
    //     handler: () => {
    //       this.voidRefundInvoice(invoice._id)
    //     }
    //   })
    // }

    if (invoice.status === 'paid' || invoice.status === 'pending') {
      buttons.push({
        text: 'Cancel Invoice',
        handler: () => {
          this.cancelInvoice(invoice._id)
        }
      })
    }

    const actionSheet = await this.actionSheetController.create({
      header: 'Options',
      buttons: buttons
    });
    await actionSheet.present();
  }

  payInvoice(invoiceId){
    this.spinner = true;
    this.invoicesService
    .getHostingPaymentPage(invoiceId)
    .subscribe(
      response => {
        this.spinner = false;
        window.open(response, "_blank");
      },
      errors => {
        this.spinner = false;
        console.log(errors);
      }
    );
  }

  async openPaymentForm(invoiceId){
    const modal = await this.modalController.create({
      component: PaymentFormComponent,
      componentProps: {
        invoiceId: invoiceId,
      },
      cssClass: 'payment-form-modal'
    });

    await modal.present();
    
  }

  async deleteInvoice(invoiceId){
    const alert = await this.alertController.create({
      header: 'Confirm!',
      message: 'Are you sure you want to delete this invoice?',
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
            
            this.invoicesService.deleteInvoice(invoiceId)
            .subscribe(
              async () => {
                this.getBondInvoices()
                await loading.dismiss();
                const toast = await this.toastController.create({
                  color: 'success',
                  duration: 3000,
                  message: 'Invoice has ben deleted successfully..',
                  showCloseButton: true,
                  position: 'top'
                });
                await toast.present()
              },
              async errors => {
                await loading.dismiss();
                console.log(errors);
              }
            );
            
          }
        }
      ]
    });

    await alert.present();
  }

  async cancelInvoice(invoiceId){
    const alert = await this.alertController.create({
      header: 'Confirm!',
      message: 'Are you sure you want to cancel this invoice?',
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
            
            this.invoicesService.cancelInvoices([invoiceId])
            .subscribe(
              async () => {
                this.getBondInvoices()
                await loading.dismiss();
                const toast = await this.toastController.create({
                  color: 'success',
                  duration: 3000,
                  message: 'Invoice has ben cancelled successfully.',
                  showCloseButton: true,
                  position: 'top'
                });
                await toast.present()
              },
              async errors => {
                await loading.dismiss();
                console.log(errors);
              }
            );
            
          }
        }
      ]
    });

    await alert.present();
  }

  async voidRefundInvoice(invoiceId){

  }

  ngOnDestroy(){
    this.subs.unsubscribe();
  }

}
