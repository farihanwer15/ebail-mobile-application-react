import { Component, ChangeDetectorRef, OnInit, Input } from '@angular/core';
import { StaffService } from '../../../services/staff.service';
import { UserStore } from '../../../@store/user.store';
import { ModalController } from '@ionic/angular';
import { SuretyService } from '../../../services/surety.service';
import { PrefixService } from '../../../services/prefix.service';


@Component({
  selector: 'app-power-filter-form',
  templateUrl: './power-filter-form.component.html',
  styleUrls: ['./power-filter-form.component.scss'],
})
export class PowerFilterFormComponent implements OnInit {
  @Input() filtersData;
  staffMembers = {
    data: [],
    meta: {}
  };
  sureties = [];
  prefixes: any = [];

  filters = {
    defendantName: undefined,
    agentId: undefined,
    prefixId: undefined,
    suretyId: undefined,
    powerNumbers: undefined,
    status: undefined,
    pageNumber: 1,
    orderBy: 'ASC'
  }

  constructor(
    private staffService: StaffService,
    private userStore: UserStore,
    private modalController: ModalController,
    private suretyService: SuretyService,
    private prefixSerivce: PrefixService,
    private cdRef: ChangeDetectorRef) { }

  ngOnInit() {
    this.loadStaff();
    this.getSureties();
    // setTimeout(() => {
    //   this.filters = this.filtersData
    // }, 1000);
  }

  reset() {
    this.filters.defendantName = undefined,
      this.filters.agentId = undefined,
      this.filters.prefixId = undefined,
      this.filters.suretyId = undefined,
      this.filters.powerNumbers = undefined,
      this.filters.status = undefined,
      this.filters.pageNumber = 1
  }

  onSuretyChange() {
    if (!this.filters.suretyId) {
      this.prefixes = []
      return;
    }
    this.loadPrefixes();
  }

  onStatusChange() {
    if (this.filters.status === 'available') {
      this.filters.agentId = undefined;
    }
  }

  loadPrefixes() {
    this.prefixSerivce.getPrefixes({
      agencyId: this.userStore.getUser().agencyId,
      suretyId: this.filters.suretyId,
      sortBy: 'name',
      orderBy: 'ASC'
    })
      .subscribe(
        prefixes => {
          this.prefixes = prefixes.data;
        },
        error => {
          console.log(error);
        }
      )
  }

  getSureties() {
    this.suretyService.getSureties({
      agencyId: this.userStore.getUser().agencyId,
      sortBy: 'name',
      orderBy: 'ASC'
    })
      .subscribe(sureties => {
        this.sureties = sureties.data;
        this.filters = this.filtersData;
      })
  }
  async closeModal() {
    await this.modalController.dismiss();
  }

  loadStaff() {
    this.staffService
      .getStaffMembers({
        agencyId: this.userStore.getUser().agencyId,
        sortBy: 'name.first',
        orderBy: 'ASC',
        blocked: false
      })
      .subscribe(
        members => {
          this.staffMembers = members;
          this.filters = this.filtersData;
        }
      )
  }

  search() {
    this.modalController.dismiss(this.filters);
  }
}