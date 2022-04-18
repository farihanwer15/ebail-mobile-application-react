import { CommonModule } from '@angular/common';
import { Component, NgModule, OnInit, Input, ViewChild } from '@angular/core';
import { IonicModule, ModalController, ToastController, LoadingController } from '@ionic/angular';
import { BillableItemsService } from '../../../services/billable-items.service';
import { UserStore } from 'src/app/@store/user.store';
import { NgForm } from '@angular/forms';
import { async } from '@angular/core/testing';
@Component({
  selector: 'app-invoice-item-form',
  templateUrl: './invoice-item-form.component.html',
  styleUrls: ['./invoice-item-form.component.scss'],
})
export class InvoiceItemFormComponent implements OnInit {

  constructor(
    private modalController: ModalController,
    private billableItemsService: BillableItemsService,
    private userStore: UserStore,
    private toastController: ToastController,
    private loadingController: LoadingController,
  ) { }
  @ViewChild('billableItemForm', { static: false }) billableItemForm: NgForm;
  @Input() itemId;

  billableItem = {
    name: undefined,
    price: undefined,
    description: undefined
  };
  errors = [];
  spinner: Boolean = false;
  ngOnInit() {
    this.getItem();
  }

  async closeModal() {
    await this.modalController.dismiss();
  }
  async validate() {

    this.errors = [];

    if (this.billableItemForm.invalid) {
      Object.keys(this.billableItemForm.controls).forEach(key => {
        this.billableItemForm.controls[key].markAsTouched();
      });
      this.errors.push('Please fill all required fields.');
      return;
    }

    if (this.errors.length > 0) {

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

  getItem() {
    if (this.itemId) {

      this.spinner = true;

      this.billableItemsService
        .getBillableItem(this.itemId)
        .subscribe(
          item => {
            this.spinner = false;
            this.billableItem.name = item.name;
            this.billableItem.price = item.price ? item.price : undefined;
            this.billableItem.description = item.description;
          },
          errors => {
            this.spinner = false;
          }
        );

    }
  }

  async onSubmit() {
    console.log('submittt')
    if (!await this.validate()) {
      return;
    }

    if (this.itemId) {
      this.updateItem();
    }
    else {
      this.addItem();
    }

  }

  async addItem() {
    const loading = await this.loadingController.create();
    await loading.present();
    let itemData = {
      agencyId: this.userStore.getUser().agencyId,
      name: this.billableItem.name ? this.billableItem.name : undefined,
      price: this.billableItem.price ? this.billableItem.price : undefined,
      description: this.billableItem.description ? this.billableItem.description : undefined,
    }
    this.billableItemsService.addItem(itemData)
      .subscribe(
        async item => {
          this.billableItemsService.itemAdded(item.insertedId);
          await loading.dismiss();
          const toast = await this.toastController.create({
            color: 'success',
            duration: 3000,
            message: 'Item created successfully',
            showCloseButton: true,
            position: 'top'
          });

          await toast.present();
          await this.modalController.dismiss();

        },
        async error => {
          await loading.dismiss();
          if (error.details) {
            error.details.forEach(err => {
              this.errors.push(err.message);
            });
          }
          this.spinner = false;
        }
      )
  }

  async updateItem() {
    const loading = await this.loadingController.create();
    await loading.present();
    let itemData = {
      name: this.billableItem.name ? this.billableItem.name : undefined,
      price: this.billableItem.price ? this.billableItem.price : undefined,
      description: this.billableItem.description ? this.billableItem.description : undefined,
    }
    this.spinner = true;
    this.billableItemsService.updateItem(this.itemId, itemData)
      .subscribe(
        async item => {
          this.spinner = false;
          this.billableItemsService.itemAdded(item.insertedId);
          await loading.dismiss();
          const toast = await this.toastController.create({
            color: 'success',
            duration: 3000,
            message: 'Item updated successfully',
            showCloseButton: true,
            position: 'top'
          });

          await toast.present();
          await this.modalController.dismiss();
        },
        error => {

          if (error.details) {
            error.details.forEach(err => {
              this.errors.push(err.message);
            });
          }
          this.spinner = false;
        }
      )
  }

}

@NgModule({
  imports: [

    CommonModule,
    IonicModule,
  ],
  declarations: [InvoiceItemFormComponent]
})
class InvoiceItemFormModule {
}