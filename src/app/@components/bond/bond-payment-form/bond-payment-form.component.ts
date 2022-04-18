import {
  Component,
  OnInit,
  Input,
  ViewChild,
  Output,
  EventEmitter,
} from "@angular/core";
import { NgForm } from "@angular/forms";
import { Subject } from "rxjs";
import { BondsService } from "src/app/services/bonds.service";
import { InvoicesService } from "src/app/services/invoices.service";
import { StaffService } from "src/app/services/staff.service";
import { UserStore } from "src/app/@store/user.store";
import { CollateralsService } from "src/app/services/collaterals.service";

import * as moment from "moment";
import * as _ from "lodash";
import { debounceTime } from "rxjs/operators";
import { ToastController, LoadingController } from "@ionic/angular";
import { DefendantsService } from "src/app/services/defendants.service";

@Component({
  selector: "app-bond-payment-form",
  templateUrl: "./bond-payment-form.component.html",
  styleUrls: ["./bond-payment-form.component.scss"],
})
export class BondPaymentFormComponent implements OnInit {
  @Input() bondId;
  @Input() defendantId;
  @ViewChild("paymentForm", { static: false }) paymentForm: NgForm;

  @Output() invoicesCreated = new EventEmitter();
  @Output() goToPreviousStep = new EventEmitter();

  bond: any = {
    indemnitors: [],
    premiumAmount: {
      $numberDecimal: 0,
    },
  };
  initialPayment = {
    amount: undefined,
    status: undefined,
    payer: {
      name: undefined,
      email: undefined,
    },
    dueDate: undefined,
    selectedPayer: undefined,
    receiptNumber: undefined,
    receivedDate: undefined,
    receivedByUserId: undefined,
    method: "Cash",
    type: "Premium",
    comments: undefined,
    saveCard: false,
  };

  remainingPayment: any = {
    method: "single-invoice",
    payer: "",
    frequency: "custom",
    startDate: "",
    amountPerInstallment: undefined,
    installments: [],
    selectedPayer: undefined,
    dueDate: undefined,
    autoProcessPayments: false,
  };

  remainingAmount;
  errors = [];
  invoices = {
    data: [],
    meta: {},
  };
  spinner = false;

  installmentAmountChanged = new Subject<string>();
  agents = {
    data: [],
    meta: {},
  };

  defIndemnitors = [];

  constructor(
    private bondsService: BondsService,
    private invoicesService: InvoicesService,
    private staffService: StaffService,
    private userStore: UserStore,
    private toastController: ToastController,
    private loadingController: LoadingController,
    private defService: DefendantsService
  ) {
    this.initialPayment.status = "pending";

    this.installmentAmountChanged
      .pipe(debounceTime(500))
      .subscribe(() => this.generateInstallments());
  }

  ngOnInit() {
    this.getDefendant();
    this.getStaffMembers();
    if (this.bondId) {
      this.getBondInvoices();
    }
  }

  getDefendant() {
    if (this.defendantId && this.bondId) {
      this.spinner = true;
      this.defService.getDefendant(this.defendantId).subscribe(
        (def) => {
          
          let indemnitors = [{
            _id: def._id,
            name: def.name,
            email: def.email,
            contacts: def.contacts,
            defendant: true,
            notifyEmail: true
          }];

          this.defIndemnitors = def.indemnitors ? indemnitors.concat(def.indemnitors) : indemnitors;

          this.defIndemnitors.forEach(indem => {
            indem.notifyEmail = true
          });

          const bond = _.find(def.bonds, (bond) => {
            return bond._id === this.bondId;
          });

          if (bond) {
            this.bond = bond;
            let initialAmount = parseFloat(bond.initialAmount);
            initialAmount += bond.filingFee ? parseFloat(bond.filingFee) : 0;
            initialAmount += bond.stateTaxFee
              ? parseFloat(bond.stateTaxFee)
              : 0;
            this.initialPayment.amount = initialAmount;

            this.remainingAmount =
              this.getTotalDueAmount() - this.initialPayment.amount;

            // if (this.bond.indemnitors && this.bond.indemnitors.length > 0) {
            //   this.initialPayment.selectedPayer = this.bond.indemnitors[0]._id;
            //   this.remainingPayment.selectedPayer = this.bond.indemnitors[0]._id;
            // } else {
            //   this.initialPayment.selectedPayer = "custom";
            // }
          }

          this.spinner = false;
        },
        (errors) => {
          this.spinner = false;
        }
      );
    }
  }

  
  getStaffMembers(){
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
        this.agents = staff.data;
      }
    )
  }
  

  getTotalDueAmount() {
    let totalDue = parseFloat(this.bond.premiumAmount);
    totalDue += this.bond.filingFee ? parseFloat(this.bond.filingFee) : 0;
    totalDue += this.bond.stateTaxFee ? parseFloat(this.bond.stateTaxFee) : 0;

    return totalDue;
  }

  onInitialAmountChange() {
    this.errors = [];

    let initialAmount = this.getInitialAmountTotal();
    if (this.initialPayment.amount) {
      this.remainingAmount = this.getTotalDueAmount() - this.initialPayment.amount;
    } else if (this.initialPayment.amount < initialAmount) {
      this.remainingAmount = this.bond.premiumAmount;
      this.errors.push("Initial amount must be greater than $" + initialAmount);
    }
  }

  getInitialAmountTotal() {
    let initialAmount = parseFloat(this.bond.initialAmount);
    initialAmount += this.bond.filingFee ? parseFloat(this.bond.filingFee) : 0;
    initialAmount += this.bond.stateTaxFee ? parseFloat(this.bond.stateTaxFee) : 0;
    return initialAmount;
  }

  generateInstallments() {
    this.errors = [];
    if (!this.remainingPayment.frequency) {
      this.errors.push("Please select a frequency");
    }
    if (!this.remainingPayment.amountPerInstallment) {
      // this.errors.push('Please enter amount per each installment.');
      return;
    }
    if (!this.remainingPayment.startDate) {
      this.errors.push("Please select installment start date.");
    }

    if (this.errors.length > 0) {
      this.remainingPayment.installments = [];
      return;
    }

    let totalInstallments = _.floor(
      this.remainingAmount / this.remainingPayment.amountPerInstallment
    );
    this.remainingPayment.installments = [];
    let f = 0;
    let fKey: any = "days";
    for (let i = 0; i < totalInstallments; i++) {
      var dueDate: any = "";
      if (
        this.remainingPayment.frequency === "weekly" ||
        this.remainingPayment.frequency === "custom"
      ) {
        dueDate = moment(
          moment(this.remainingPayment.startDate).add(f, "days")
        ).format("MM/DD/YYYY");
        f += 7;
      } else if (this.remainingPayment.frequency === "biweekly") {
        dueDate = moment(
          moment(this.remainingPayment.startDate).add(f, "days")
        ).format("MM/DD/YYYY");
        f += 15;
      } else if (this.remainingPayment.frequency === "monthly") {
        dueDate = moment(
          moment(this.remainingPayment.startDate).add(f, "months")
        ).format("MM/DD/YYYY");
        f++;
        fKey = "months";
      }

      this.remainingPayment.installments.push({
        dueDate: dueDate,
        amount: this.remainingPayment.amountPerInstallment,
      });
    }

    let remainingInstallment =
      this.remainingAmount -
      _.multiply(this.remainingPayment.amountPerInstallment, totalInstallments);
    if (remainingInstallment > 0) {
      this.remainingPayment.installments.push({
        dueDate: moment(
          moment(this.remainingPayment.startDate).add(f, fKey)
        ).format("MM/DD/YYYY"),
        amount: remainingInstallment,
      });
    }
  }

  onInstallmentFrequencyChange() {
    this.initInstallmentStartDate();
    this.generateInstallments();
  }

  initInstallmentStartDate() {
    if (
      this.remainingPayment.frequency === "weekly" ||
      this.remainingPayment.frequency === "custom"
    ) {
      this.remainingPayment.startDate = moment(
        moment(this.initialPayment.dueDate).add(7, "days")
      ).format("MM/DD/YYYY");
    }

    if (this.remainingPayment.frequency === "monthly") {
      this.remainingPayment.startDate = moment(
        moment(this.initialPayment.dueDate).add(1, "months")
      ).format("MM/DD/YYYY");
    }

    if (this.remainingPayment.frequency === "biweekly") {
      this.remainingPayment.startDate = moment(
        moment(this.initialPayment.dueDate).add(15, "days")
      ).format("MM/DD/YYYY");
    }
  }

  onInstallmentAmountChange() {
    this.installmentAmountChanged.next();
  }

  onStartDateChange() {
    this.generateInstallments();
  }

  onInitialPaymentDueDateChange() {
    this.initInstallmentStartDate();
    this.onStartDateChange();
  }

  async validate() {
    this.errors = [];

    if (this.paymentForm.invalid) {
      Object.keys(this.paymentForm.controls).forEach((key) => {
        this.paymentForm.controls[key].markAsTouched();
      });
      this.errors.push("Please fill all required fields.");
    }

    if (this.errors.length > 0) {
      const toast = await this.toastController.create({
        color: "danger",
        duration: 3000,
        message: "Please fill all required fields.",
        showCloseButton: true,
        position: "top",
      });

      await toast.present();

      return false;
    }
    return true;
  }

  async onSubmit() {
    if (!(await this.validate())) {
      return;
    }

    let payers = [];
    if (this.initialPayment.selectedPayer !== "custom") {
      let payer = _.find(this.defIndemnitors, (indem) => {
        return indem._id === this.initialPayment.selectedPayer;
      });

      if (payer) {
        payers.push(payer);
      }
    } else {
      payers.push({
        name: this.initialPayment.payer.name,
        email: this.initialPayment.payer.email,
      });
    }

    // CALCULATING INITIAL AMOUNT.

    let filingFee = this.bond.filingFee ? parseFloat(this.bond.filingFee) : 0;
    let stateTaxFee = this.bond.stateTaxFee
      ? parseFloat(this.bond.stateTaxFee)
      : 0;
    let initialAmount = this.initialPayment.amount - filingFee - stateTaxFee;

    let invoices = [];
    let initialInvoice: any = {
      agencyId: this.userStore.getUser().agencyId,
      officeId: this.userStore.getUser().office._id,
      title: "Bond Initial Invoice",
      date: moment().format("MM/DD/YYYY"),
      items: [
        {
          name: "Initial Amount",
          amount: initialAmount,
        },
      ],
      status: this.initialPayment.status,
      payers: payers,
      dueDate: moment(this.initialPayment.dueDate).format("MM/DD/YYYY"),
      bondId: this.bondId,
      createdByUserId: this.userStore.getUser().id,
      comments: this.initialPayment.comments
        ? this.initialPayment.comments
        : undefined,
      totalAmount: parseFloat(this.initialPayment.amount),
      defendantId: this.defendantId,
      send: true,
      saveCard: this.initialPayment.saveCard,
      paymentPlanInvoice: true,
    };

    // ADDING FILING FEE IF PROVIDED.
    if (this.bond.filingFee) {
      initialInvoice.items.push({
        name: "Filing Fee",
        amount: parseFloat(this.bond.filingFee),
      });
    }

    // ADDING STATE TAX FEE IF PROVIDED.
    if (this.bond.stateTaxFee) {
      initialInvoice.items.push({
        name: "State Tax Fee",
        amount: parseFloat(this.bond.stateTaxFee),
      });
    }

    let payment = null;
    if (this.initialPayment.status === "paid") {
      initialInvoice.payment = {
        agencyId: this.userStore.getUser().agencyId,
        officeId: this.userStore.getUser().office._id,
        amount: parseFloat(this.initialPayment.amount),
        status: "settled",
        method: this.initialPayment.method,
        type: this.initialPayment.type,
        comments: this.initialPayment.comments,
        receivedByUserId: this.initialPayment.receivedByUserId,
      };
    }

    invoices.push(initialInvoice);

    payers = [];
    if (this.remainingPayment.selectedPayer !== "custom") {
      let payer = _.find(this.defIndemnitors, (indem) => {
        return indem._id === this.remainingPayment.selectedPayer;
      });

      if (payer) {
        payers.push({
          indemnitorId: payer._id,
          name: payer.name.first + " " + payer.name.last,
          email: payer.email,
        });
      }
    }

    // CREATING REMAINIG  INVOICES
    if (this.remainingAmount > 0) {
      // IF CS WANT TO PAY IN SINGLE INVOICE.
      if (this.remainingPayment.method === "single-invoice") {
        let remainingInvoice = {
          agencyId: this.userStore.getUser().agencyId,
          officeId: this.userStore.getUser().office._id,
          title: "Bond Installment",
          date: moment().format("MM/DD/YYYY"),
          status: "pending",
          items: [
            {
              name: "Bond Installment",
              amount: this.remainingAmount,
            },
          ],
          dueDate: moment(this.remainingPayment.dueDate).format("MM/DD/YYYY"),
          payers: payers,
          bondId: this.bondId,
          createdByUserId: this.userStore.getUser().id,
          totalAmount: this.remainingAmount,
          defendantId: this.defendantId,
          autoProcessPayments: this.remainingPayment.autoProcessPayments,
          paymentPlanInvoice: true,
        };

        invoices.push(remainingInvoice);
      }

      // IF CS WANTS TO PAY IN INSTALLMENTS.
      if (this.remainingPayment.method === "installments") {
        this.remainingPayment.installments.forEach((installment, index) => {
          let invoice = {
            agencyId: this.userStore.getUser().agencyId,
            officeId: this.userStore.getUser().office._id,
            title: "Bond Installment " + (index + 1),
            date: moment().format("MM/DD/YYYY"),
            status: "pending",
            items: [
              {
                name: "Bond Installment " + (index + 1),
                amount: installment.amount,
              },
            ],
            dueDate: moment(installment.dueDate).format("MM/DD/YYYY"),
            payers: payers,
            bondId: this.bondId,
            createdByUserId: this.userStore.getUser().id,
            totalAmount: installment.amount,
            defendantId: this.defendantId,
            autoProcessPayments: this.remainingPayment.autoProcessPayments,
            paymentPlanInvoice: true,
          };
          invoices.push(invoice);
        });
      }
    }

    const loading = await this.loadingController.create();
    await loading.present();
    this.invoicesService.addInvoices(invoices).subscribe(
      async (response) => {
        await loading.dismiss();
        this.invoicesCreated.emit();
        this.bondsService.bondUpdated();
      },
      async (errors) => {
        await loading.dismiss();
        console.log(errors);
      }
    );
  }

  getBondInvoices() {
    this.spinner = true;
    this.invoicesService
      .getInvoices({
        bondId: this.bondId,
        canceledAt: {
          $exists: false
        },
        paymentPlanInvoice: true,
        project: {
          title: 1,
          items: 1,
          "defendant.bonds.power": 1,
          date: 1,
          status: 1,
          totalAmount: 1,
          _id: 1,
          "payers.contacts": 1,
          "payers.name": 1,
          "payers.email": 1,
          "payers._id": 1,
          dueDate: 1,
          paymentPlanInvoice: 1
        }
      })
      .subscribe(
        (invoices) => {
          this.invoices = invoices;
          this.spinner = false;
        },
        (errors) => {
          this.spinner = false;
        }
      );
  }

  previousStep() {
    this.goToPreviousStep.emit();
  }

  cancelAllInvoices() {
    let ids = [];
    this.invoices.data.forEach((inv) => {
      ids.push(inv._id);
    });

    this.spinner = true;
    this.invoicesService.cancelInvoices(ids).subscribe(
      (res) => {
        this.getBondInvoices();
        this.spinner = false;
      },
      (err) => {
        this.spinner = false;
      }
    );
  }

  onRemainingPaymentMethodChange() {
    if (this.remainingPayment.method === "installments") {
      this.remainingPayment.autoProcessPayments = true;
      this.initialPayment.saveCard = true;
    }
  }

  
  isPaymentPlanComplete(){
    let instInvoicesTotal = 0;

    if (this.invoices.data.length <= 0) {
      return false;
    }
        
    for (let i = 0; i < this.invoices.data.length; i++) {
      const inv = this.invoices.data[i];
      if (inv.title !== 'Bond Initial Invoice') {
        instInvoicesTotal += parseFloat(inv.totalAmount);
      }
    }

    if (instInvoicesTotal >= this.remainingAmount ) {
      // this.paymentPlanComplete = true
      return true
    }
    return false;
  }
}
