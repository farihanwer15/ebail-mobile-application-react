import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DefendantQuickFormComponent } from './defendant/defendant-quick-form/defendant-quick-form.component';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { DefendantProfileComponent } from './defendant/defendant-profile/defendant-profile.component';
import { BondDetailsComponent } from './bond/bond-details/bond-details.component';
import { BondInfoComponent } from './bond/bond-info/bond-info.component';
import { BondReceiptsComponent } from './bond/bond-receipts/bond-receipts.component';
import { BondInvoicesComponent } from './bond/bond-invoices/bond-invoices.component';
import { BondIndemnitorsComponent } from './bond/bond-indemnitors/bond-indemnitors.component';
import { CourtDatesComponent } from './bond/court-dates/court-dates.component';
import { BondContractsComponent } from './bond/bond-contracts/bond-contracts.component';
import { BondCollateralsComponent } from './bond/bond-collaterals/bond-collaterals.component';
import { BondInfoFormComponent } from './bond/bond-info-form/bond-info-form.component';
import { CourtDateFormComponent } from './bond/court-date-form/court-date-form.component';
import { AddCourtFormComponent } from './bond/add-court-form/add-court-form.component'
import { BondIndemnitorFormComponent } from './bond/bond-indemnitor-form/bond-indemnitor-form.component';
import { AddBondIndemnitorFormComponent } from './bond/add-bond-indemnitor-form/add-bond-indemnitor-form.component'
import { CollateralFormComponent } from './bond/collateral-form/collateral-form.component';
import { BondPaymentFormComponent } from './bond/bond-payment-form/bond-payment-form.component';
import { BondReviewComponent } from './bond/bond-review/bond-review.component';
import { BondStatusComponent } from './bond/bond-status/bond-status.component';
import { ForfeitureFormComponent } from './bond/forfeiture-form/forfeiture-form.component';
import { PowerFilterFormComponent } from './bond/power-filter-form/power-filter-form.component';
import { CourtFilterFormComponent } from '../@components/bond/court-filter-form/court-filter-form.component';
import { ExonerationFormComponent } from './bond/exoneration-form/exoneration-form.component';
import { DefendantFilterFormComponent } from '../@components/bond/defendant-filter-form/defendant-filter-form.component';
import { ImageCropperComponent } from './image-cropper/image-cropper.component';
import { ScanDocumentComponent } from '../@components/scan-document/scan-document.component';
import { ArrestAlertComponent } from '../@components/arrest-alert/arrest-alert.component';
import { DefendantUploadDocumentFormComponent } from '../@components/bond/defendant-upload-document-form/defendant-upload-document-form.component'
import { PettyCashSpentFormComponent } from './bond/petty-cash-spent-form/petty-cash-spent-form.component'
import { DocumentUploaderComponent } from './document-uploader/document-uploader.component';
import { NoteFormComponent } from './notes/note-form/note-form.component';
import { NotesListComponent } from './notes/notes-list/notes-list.component';
import { AutocompleteAddressComponent } from './bond/autocomplete-address/autocomplete-address.component'
import { FortfeitureFilterFormComponent } from './bond/fortfeiture-filter-form/fortfeiture-filter-form.component'
import { MaskDirective } from '../mask.directive';
import { ImageCropperModule } from 'ngx-image-cropper';
import { GoogleMapsModule } from "@angular/google-maps";
import { NgxIonicImageViewerModule } from 'ngx-ionic-image-viewer';
import { DefendantDocumentsComponent } from './defendant-documents/defendant-documents.component';
import { DefendantDocumentFormComponent } from './defendant-document-form/defendant-document-form.component';
import { DefendantIndemnitorsListComponent } from './defendant/defendant-indemnitors-list/defendant-indemnitors-list.component'
import { RouterModule } from '@angular/router';
import { DefendantFormComponent } from './defendant/defendant-form/defendant-form.component';
import { PdfJsViewerModule } from 'ng2-pdfjs-viewer';
import { IonicSelectableModule } from 'ionic-selectable';
import { DefendantDoucumentFormComponent } from './bond/defendant-doucument-form/defendant-doucument-form.component';
import { AddPowerFormComponent } from '../@components/bond/add-power-form/add-power-form.component';
import { DragulaModule } from 'ng2-dragula';
import { InvoiceItemFormComponent } from '../@components/invoices/invoice-item-form/invoice-item-form.component';
import { MerchantAccountSignupNoticeComponent } from '../@components/invoices/merchant-account-signup-notice/merchant-account-signup-notice.component';
import { BrMaskerModule } from 'br-mask';
import { ContractFormComponent } from './bond/contract-form/contract-form.component';
import { ContractListComponent } from './bond/contract-list/contract-list.component';
import { PaymentFormComponent } from './payment-form/payment-form.component';
import { InvoiceFormComponent } from './invoices/invoice-form/invoice-form.component'
import { MapViewComponent } from './map-view/map-view.component'
import { CheckinDetailComponent } from '../check-ins-page/checkin-detail/checkin-detail.component';
import { ScheduleRemindersPopoverComponent } from '../check-ins-page/schedule-reminders-popover/schedule-reminders-popover.component';

const COMPONENTS = [
  DefendantQuickFormComponent,
  DefendantProfileComponent,
  BondDetailsComponent,
  BondInfoComponent,
  BondReceiptsComponent,
  BondInvoicesComponent,
  BondIndemnitorsComponent,
  CourtDatesComponent,
  BondContractsComponent,
  BondCollateralsComponent,
  BondInfoFormComponent,
  CourtDateFormComponent,
  AddCourtFormComponent,
  BondIndemnitorFormComponent,
  ContractFormComponent,
  ContractListComponent,
  AddBondIndemnitorFormComponent,
  CollateralFormComponent,
  BondPaymentFormComponent,
  BondReviewComponent,
  BondStatusComponent,
  ForfeitureFormComponent,
  PowerFilterFormComponent,
  CourtFilterFormComponent,
  DefendantFilterFormComponent,
  ExonerationFormComponent,
  PettyCashSpentFormComponent,
  ImageCropperComponent,
  ScanDocumentComponent,
  ArrestAlertComponent,
  InvoiceItemFormComponent,
  MerchantAccountSignupNoticeComponent,
  DefendantUploadDocumentFormComponent,
  DocumentUploaderComponent,
  NoteFormComponent,
  NotesListComponent,
  DefendantDocumentsComponent,
  DefendantDocumentFormComponent,
  DefendantFormComponent,
  AddPowerFormComponent,
  AutocompleteAddressComponent,
  FortfeitureFilterFormComponent,
  DefendantDoucumentFormComponent,
  PaymentFormComponent,
  DefendantIndemnitorsListComponent,
  InvoiceFormComponent,
  MapViewComponent,
  CheckinDetailComponent,
  ScheduleRemindersPopoverComponent
];

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    ImageCropperModule,
    RouterModule,
    PdfJsViewerModule,
    GoogleMapsModule,
    IonicSelectableModule,
    DragulaModule.forRoot(),
    BrMaskerModule
  ],
  entryComponents: [
    DefendantQuickFormComponent,
    DefendantProfileComponent,
    BondDetailsComponent,
    CourtDateFormComponent,
    AddCourtFormComponent,
    CollateralFormComponent,
    BondIndemnitorsComponent,
    BondStatusComponent,
    ImageCropperComponent,
    ScanDocumentComponent,
    ArrestAlertComponent,
    InvoiceItemFormComponent,
    MerchantAccountSignupNoticeComponent,
    DefendantUploadDocumentFormComponent,
    DocumentUploaderComponent,
    BondIndemnitorFormComponent,
    ContractFormComponent,
    ContractListComponent,
    AddBondIndemnitorFormComponent,
    PowerFilterFormComponent,
    CourtFilterFormComponent,
    DefendantFilterFormComponent,
    NoteFormComponent,
    NotesListComponent,
    DefendantIndemnitorsListComponent,
    FortfeitureFilterFormComponent,
    DefendantDocumentFormComponent,
    DefendantFormComponent,
    PettyCashSpentFormComponent,
    AddPowerFormComponent,
    DefendantDoucumentFormComponent,
    PaymentFormComponent,
    InvoiceFormComponent,
    MapViewComponent,
    CheckinDetailComponent,
    ScheduleRemindersPopoverComponent
  ],
  exports: [...COMPONENTS],
  declarations: [...COMPONENTS, MaskDirective]
})

export class ComponentsModule { }
