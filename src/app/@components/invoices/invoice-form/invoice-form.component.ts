import { ModalController, ToastController, LoadingController } from '@ionic/angular';
import { Component, OnInit, Input, ViewChild, ElementRef, Inject, OnDestroy } from '@angular/core';
import { InvoicesService } from '../../../services/invoices.service';
import { BillableItemsService } from '../../../services/billable-items.service';
import { BondsService } from '../../../services/bonds.service';
import { DefendantsService } from '../../../services/defendants.service';
import { NgForm } from '@angular/forms';
import { UserStore } from 'src/app/@store/user.store';

const _ = require('lodash');
import * as moment from 'moment';
import { StaffService } from '../../../services/staff.service';
//import { DOCUMENT } from '@angular/common';
import { Subscription } from 'rxjs';
import { PaymentsService } from '../../../services/payments.service';
import { InvoiceItemFormComponent } from '../invoice-item-form/invoice-item-form.component';
import {MerchantAccountSignupNoticeComponent} from '../merchant-account-signup-notice/merchant-account-signup-notice.component'


@Component({
  selector: 'app-invoice-form',
  templateUrl: './invoice-form.component.html',
  styleUrls: ['./invoice-form.component.scss'],
})
export class InvoiceFormComponent implements OnInit {
  step = 1;
  @ViewChild('invoiceForm', { static: false }) invoiceForm: NgForm;
  @ViewChild('formContainer', { static: false }) public formContainer: ElementRef;

  @Input() defendantId;
  @Input() invoiceId;
  @Input() paymentId;

  errors = [];
  spinner = false;

  sendInvoice = true;

  invoice: any = {
    dueDate: undefined,
    payers: [],
    items: [],
    notes: undefined,
    status: 'pending',
    payment: {
      receivedDate: undefined,
      receivedByUserId: undefined,
      method: 'Cash'
    },
    saveCard: false,
  };

  payment = undefined;

  customPayer = {
    name: {
      first: undefined
    },
    email: undefined,
    phone: undefined
  }

  selectedPayer = undefined;
  showCustomPayerForm = false;

  invoiceItem = {
    id: undefined,
    description: undefined,
    amount: undefined,
    bondId: undefined,
  };

  staff = [];

  indemnitors = [];
  billableItems = {
    data: [],
    meta: {}
  }

  bonds = [];
  subs = new Subscription();

  constructor(
    private invoicesService: InvoicesService,
    private billableItemsService: BillableItemsService,

    private bondsService: BondsService,
    private defendantsService: DefendantsService,
    private userStore: UserStore,
    private staffService: StaffService,
    private billableItemService: BillableItemsService,
    private paymentService: PaymentsService,
    private modalController: ModalController,
    private toastController: ToastController,
    private loadingController: LoadingController,




    // @Inject(DOCUMENT) private document: any
  ) { }

  ngOnInit() {
    this.getPayment();
    this.getDefendantData();
    this.getBillableItems();
    this.getStaffMembers();

    if (!this.defendantId && !this.invoiceId) {
      this.selectedPayer = 'custom';
    }
    this.initEvents();
  }

  initEvents() {
    this.subs.add(
      this.billableItemService.itemAdded$.subscribe(
        () => {
          console.log('bilableeee Amounttt')
          this.getBillableItems();
        }
      )
    )

    this.subs.add(
      // this.defendantsService.merchantSignupClose$.subscribe(
      //   () => {
      //     this.merchantSigupWindowRef ? this.merchantSigupWindowRef.close() : '';
      //   }
      // )
    )
  }

  async closeModal() {
    await this.modalController.dismiss();
  }

  switchStep(step) {
    if (step === 2) {
      this.goToStep2()
    }
    if (step === 3) {
      this.goToStep3()
    }
    if (step === 1) {
      this.step = 1
    }
    //this.step = step;
  }
  goBack() {
    if (this.step > 1) {
      this.step--;
    }
  }

  getDefendantData() {
    console.log('this.defendantId', this.defendantId);

    if (this.defendantId) {
      this.indemnitors = [];
      this.defendantsService
        .getDefendant(this.defendantId)
        .subscribe(
          def => {
            this.indemnitors.push({
              _id: def._id,
              name: def.name,
              email: def.email,
              contacts: def.contacts,
              defendant: true,
              notifyEmail: def.email ? true : false,
              notifySMS: def.contacts && def.contacts.length > 0 ? true : false
            });

            if (def.indemnitors) {
              def.indemnitors.forEach(indem => {
                indem.notifyEmail = indem.email ? true : false,
                  indem.notifySMS = indem.contacts && indem.contacts.length > 0 ? true : false
              });
              this.indemnitors = this.indemnitors.concat(def.indemnitors);
            }

            def && def.bonds&&def.bonds.forEach(item => {
              let next = true;
              let label = ''
              if (next && this.userStore.getAgency().showPowerNumber && item.power && item.power.prefix) {
                item.tabValue = item.power.prefix.name + "-" + item.power.number;
                next = false;
              }
              else if (next && this.userStore.getAgency().showPowerNumber && item.powers && item.powers.length > 0) {
                item.tabValue = ''
                item.powers.forEach((power, index) => {
                  if (power.prefix) {
                    item.tabValue += `${power.prefix.name}-${power.number}`;
                    item.tabValue += index < (item.powers.length - 1) ? ', ' : ''
                  }
                })

                next = item.tabValue === '' ? true : false;
              }
              else if (next && this.userStore.getAgency().showPowerNumber) {

                label = 'Missing Power Number'
                item.tabValue = label
              }
              if (next && this.userStore.getAgency().showBondNumber && item.bondNumber) {
                item.tabValue = item.bondNumber;
                next = false;
              } else if (next && this.userStore.getAgency().showBondNumber && !this.userStore.getAgency().showPowerNumber) {

                label = 'Missing Bond Number'
                item.tabValue = label
              }
              if (next && this.userStore.getAgency().showCaseNumber && item.caseNumber) {
                item.tabValue = item.caseNumber;
                next = false;
              } else if (next && this.userStore.getAgency().showCaseNumber && !this.userStore.getAgency().showBondNumber && !this.userStore.getAgency().showPowerNumber) {

                label = 'Missing Case Number'
                item.tabValue = label
              }
              if (next && this.userStore.getAgency().showCharge && item.charges && item.charges.length > 0) {
                item.tabValue = item.charges && item.charges.toString()
                next = false
              }
              else if (next && this.userStore.getAgency().showCharge && item.powers && item.powers.length > 0) {
                item.tabValue = ''
                item.powers.forEach((power, index) => {
                  if (power.charges && power.charges.length > 0) {
                    power.charges.forEach(charge => {
                      item.tabValue += charge;
                      item.tabValue += index < (item.powers.length - 1) ? ', ' : ''
                    });
                  }
                })

                next = item.tabValue === '' ? true : false;
              }
              else if (next && this.userStore.getAgency().showCharge && !this.userStore.getAgency().showCaseNumber && !this.userStore.getAgency().showBondNumber && !this.userStore.getAgency().showPowerNumber) {
                label = 'Missing Charges'
                item.tabValue = label
              }
            });

            this.bonds = def.bonds ? def.bonds : [];
            console.log('bonds', this.bonds)
          },
          errors => {

          }
        )
    }
  }

  getPayment() {
    if (this.paymentId) {
      this.paymentService.getPayment(this.paymentId)
        .subscribe(payment => {
          if (payment) {
            this.invoiceItem.amount = payment.amount;
            this.invoice.dueDate = moment(payment.createdAt);
            this.invoice.status = 'paid'
            this.invoice.payment.receivedDate = moment(payment.createdAt);
            this.invoice.payment.method = 'Card';
            this.invoice.payment.receivedByUserId = payment.receivedByUser._id;
            this.payment = payment;
          }
        })
    }
  }

  getStaffMembers() {
    this.staffService
      .getStaffMembers({
        agencyId: this.userStore.getUser().agencyId,
        orderBy: 'ASC',
        sortBy: 'name.first',
        blocked: false,
        project: {
          _id: 1,
          name: 1,
          email: 1,
          roles: 1,
          agencyId: 1,
          officeId: 1,
        }
      })
      .subscribe(
        staff => {
          this.staff = staff.data;
        }
      )
  }

  getBillableItems() {
    this.billableItemsService
      .getBillableItems({
        agencyId: this.userStore.getUser().agencyId,
        sortBy: 'name',
        orderBy: 'ASC'
      })
      .subscribe(
        items => {
          this.billableItems = items;
          console.log(items);
        }
      )
  }

  scrollToTop(): void {
    const elmnt = this.formContainer.nativeElement;
    elmnt.scrollIntoView({ behavior: 'smooth' })
  }

  addToSelectedPeople(event, person) {
    if (event.detail.checked) {
      console.log('checked', event.detail.checked)
      this.invoice.payers.push({
        _id: person._id,
        name: person.name,
        email: person.email,
        contacts: person.contacts,
        defendant: person.defendant,
        notifyEmail: person.notifyEmail,
        notifySMS: person.notifySMS
      })
    }
    else {
      console.log('elseee')
      _.remove(this.invoice.payers, p => {
        return p._id === person._id
      })
    }
    console.log(this.invoice.payers)
  }

  async addItem() {

    this.errors = [];
    if (!this.invoiceItem.id) {
      //this.errors.push('Please select an item.');
      const toast = await this.toastController.create({
        color: 'danger',
        duration: 3000,
        message: 'Please select an item.',
        showCloseButton: true,
        position: 'top'
      });

      await toast.present();

      return false
    }

    if (!this.invoiceItem.amount) {
      const toast = await this.toastController.create({
        color: 'danger',
        duration: 3000,
        message: 'Please enter item amount.',
        showCloseButton: true,
        position: 'top'
      });

      await toast.present();

      return false;
    }
    if (isNaN(this.invoiceItem.amount)) {
      // this.errors.push('Amount must be a number.');
      const toast = await this.toastController.create({
        color: 'danger',
        duration: 3000,
        message: 'Amount must be a number.',
        showCloseButton: true,
        position: 'top'
      });

      await toast.present();

      return false;
    }

   

    let item = _.find(this.billableItems.data, (i) => {
      return i._id === this.invoiceItem.id;
    });

    this.invoice.items.push({
      itemId: this.invoiceItem.id,
      name: item.name,
      description: this.invoiceItem.description,
      amount: this.invoiceItem.amount,
      bondId: this.invoiceItem.bondId
    });

    this.invoiceItem = {
      id: undefined,
      description: undefined,
      amount: undefined,
      bondId: undefined
    };
  }

  removeItem(index) {
    _.remove(this.invoice.items, (item, i) => {
      return i === index;
    });
  }

  getInvoiceTotal() {
    let total = 0;
    this.invoice.items.forEach(item => {
      total += parseFloat(item.amount);
    });
    return total;
  }
  async goToStep2() {
    this.errors = [];
    if (this.invoice.items.length < 1) {
      const toast = await this.toastController.create({
        color: 'danger',
        duration: 3000,
        message: 'Please add at least one invoice item to proceed.',
        showCloseButton: true,
        position: 'top'
      });

      await toast.present();

      return false
    }


    this.step = 2;


  }

  async goToStep3() {
    this.errors = [];
    if (this.invoice.payers.length < 1) {
      const toast = await this.toastController.create({
        color: 'danger',
        duration: 3000,
        message: 'Please select at least one payer to proceed.',
        showCloseButton: true,
        position: 'top'
      });

      await toast.present();

      return false
    }
    this.step = 3;


  }

  async validate() {

    this.errors = [];
    if (this.invoiceForm.invalid) {
      Object.keys(this.invoiceForm.controls).forEach(key => {
        this.invoiceForm.controls[key].markAsTouched();
      });
      this.errors.push('Please fill all required fields.');
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

  async onSubmit() {

    if (!await this.validate()) {
      return;
    }

    let title = 'Defendant Invoice';
    if (this.invoice.status === 'adjustment') {
      title = 'Adjustment';
    }

    this.invoice.payers.forEach(payer => {
      if (payer && payer.contacts && payer.contacts.length) {
        payer.contacts.forEach(contact => {
          if (contact.display) {
            delete contact.display
          }
        });
      }
    });
    let invoiceData: any = {
      title: title,
      totalAmount: this.getInvoiceTotal(),
      agencyId: this.userStore.getUser().agencyId,
      officeId: this.userStore.getUser().office._id,
      date: moment().utc(true).format('YYYY-MM-DD'),
      createdByUserId: this.userStore.getUser().id,
      dueDate: moment(this.invoice.dueDate).utc(true).format('YYYY-MM-DD'),
      defendantId: this.defendantId,
      status: this.invoice.status,
      items: this.invoice.items,
      notes: this.invoice.notes,
      send: this.sendInvoice ? true : undefined,
      payers: this.invoice.payers,
      saveCard: this.invoice.saveCard,
      paymentId: this.paymentId
    };

    if (this.invoice.status === 'paid') {
      invoiceData.payment = {
        agencyId: this.userStore.getUser().agencyId,
        officeId: this.userStore.getUser().office._id,
        amount: this.getInvoiceTotal(),
        status: 'settled',
        method: this.invoice.payment.method,
        receivedByUserId: this.invoice.payment.receivedByUserId,
        createdAt: this.invoice.payment.receivedDate
      }
    }
    console.log('invoiceData', invoiceData)

    // if(this.selectedPayer === 'custom'){
    //   invoiceData.payers = [this.invoice.payer];
    // }

    // if(this.selectedPayer && this.selectedPayer !== 'custom'){
    //   let indem = _.find(this.indemnitors, (i) => {
    //     return i._id === this.selectedPayer;
    //   });

    //   if(indem){
    //     invoiceData.payers = [indem];
    //   }
    // }
    if (this.invoiceId) {
      this.updateInvoice();
    }
    else {
      this.createNewInvoice(invoiceData);
    }
  }

  async createNewInvoice(data) {
    const loading = await this.loadingController.create();
    await loading.present();

    this.invoicesService
      .addSingleInvoice(data)
      .subscribe(
        async invoice => {
          this.spinner = false;
          this.invoicesService.invoiceAdded();
          await loading.dismiss();
          const toast = await this.toastController.create({
            color: 'success',
            duration: 3000,
            message: 'Invoice created successfully',
            showCloseButton: true,
            position: 'top'
          });

          await toast.present();
          await this.modalController.dismiss();

          // if(this.bondId){
          //   this.invoicesService.getBondInvoices(this.bondId);
          // }

        },
        async errors => {
          console.log(errors);
          await loading.dismiss();
          const toast = await this.toastController.create({
            color: 'danger',
            duration: 3000,
            message: 'Something went wrong please try again',
            showCloseButton: true,
            position: 'top'
          });

          await toast.present();
          this.spinner = false;
        }
      );
  }

  updateInvoice() {
  }

  getBondNumber(bondId) {
    let bond = _.find(this.bonds, (b) => {
      return b._id === bondId;
    });

    let str = "";
    if (bond && bond.power && bond.power.prefix) {
      str = bond.power.prefix.name + '-' + bond.power.number;
    }
    else if (bond && bond.bondNumber) {
      str = bond.bondNumber;
    }
    else {
      str = 'No Power or Bond #'
    }

    return {
      number: str,
      amount: bond.bondAmount
    };
  }

  addPayer() {

    const indemExists = _.find(this.invoice.payers, (i) => {
      return i._id === this.selectedPayer;
    });

    if (!indemExists && this.selectedPayer !== 'custom') {
      let indem = _.find(this.indemnitors, (i) => {
        return i._id === this.selectedPayer;
      });

      if (indem) {
        if (indem && indem.contacts && indem.contacts.length) {

          indem.contacts.forEach(contact => {

            if (contact.primary) {
              indem.contacts[indem.contacts.length - 1]['display'] = true
            } else {
              indem.contacts[indem.contacts.length - 1]['display'] = true
            }
          });
        }

        this.invoice.payers.push(indem);
      }
      this.selectedPayer = undefined;

    }

  }

  removePayer(payer) {
    _.remove(this.invoice.payers, (p) => {
      return p._id === payer._id;
    });
  }

  saveCustomPayer() {
    if (!this.customPayer.name.first || !this.customPayer.email) {
      return
    }

    let contacts = [];
    if (this.customPayer.phone) {
      contacts.push({
        key: 'Phone',
        value: this.customPayer.phone
      })
    }

    this.indemnitors.push({
      name: {
        first: this.customPayer.name.first
      },
      email: this.customPayer.email,
      contacts: contacts.length > 0 ? contacts : undefined,
      type: 'custom',
      notifyEmail: true,
      notifySMS: this.customPayer.phone ? true : false,
      checked: true
    })

    // this.invoice.payers.push({
    //   _id: Math.floor(100000000 + Math.random() * 900000000).toString(),
    //   name: {
    //     first: this.customPayer.name.first
    //   },
    //   email: this.customPayer.email,
    //   contacts: contacts.length > 0 ? contacts : undefined,
    //   type: 'custom'
    // })

    this.customPayer.name.first = undefined;
    this.customPayer.email = undefined;
    this.customPayer.phone = undefined;
    this.showCustomPayerForm = false;
  }

  cancelCustomPayer() {

    this.customPayer.name.first = undefined;
    this.customPayer.email = undefined;
    this.customPayer.phone = undefined;
    this.showCustomPayerForm = false;
  }

  async openAddItemWindow() {
    const modal = this.modalController.create({
      component: InvoiceItemFormComponent,
    });
    (await modal).present();
  }

  // openAddItemWindow(){
  //   this.itemWindowRef = this.windowService.open(BillableItemFormComponent, {
  //     title: 'Add New Item',
  //     windowClass: 'custom-window'
  //   })
  // }


  async saveCardCheckedChange(checked) {
    if (checked.detail.checked && !this.userStore.getAgency().ziftAccountId) {
      const modal = this.modalController.create({
        component: MerchantAccountSignupNoticeComponent,
      });
      (await modal).present();
      setTimeout(() => {
        this.invoice.saveCard = false
      }, 500)
      return;
    }
  }

  // saveCardCheckedChange(checked){
  //   if (checked && !this.userStore.getAgency().ziftAccountId) {
  //     this.merchantSigupWindowRef = this.windowService.open(MerchantAccountSignupNoticeComponent, {
  //       title: 'Oops',
  //       windowClass: 'merchant-account-notice-window'
  //     });
  //     setTimeout(() => {
  //       this.invoice.saveCard = false
  //     }, 500)
  //     return;
  //   }
  // }

  onStatusChange() {
  }

  onSmsCheckChange(check, payerId) {
    const indemIndex = _.findIndex(this.indemnitors, indem => {
      return indem._id === payerId;
    })

    if (indemIndex >= 0) {
      this.indemnitors[indemIndex].notifySMS = check
    }

    const payerIndex = _.findIndex(this.invoice.payers, payer => {
      return payer._id === payerId;
    })

    if (payerIndex >= 0) {
      this.invoice.payers[payerIndex].notifySMS = check
    }
  }

  onItemSelected() {
    const bItem = _.find(this.billableItems.data, item => {
      return item._id === this.invoiceItem.id
    })

    if (bItem && bItem.price > 0) {
      this.invoiceItem.amount = bItem.price;
    }
    else {
      this.invoiceItem.amount = undefined
    }
  }
  ngOnDestroy() {
    this.subs.unsubscribe();
  }

}
