import { Component, OnInit,Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AgencyService } from '../../../services/agency.service';
import { UserStore } from '../../../@store/user.store';

@Component({
  selector: 'app-defendant-filter-form',
  templateUrl: './defendant-filter-form.component.html',
  styleUrls: ['./defendant-filter-form.component.scss'],
})
export class DefendantFilterFormComponent implements OnInit {
  @Input() filtersData;
  
  subAgencies = [];
  filters = {
    agencyId: undefined,
    name: undefined,
    monitoringStatus : undefined,
    status: undefined,
    sort: undefined,
    createdAt: {
      start: undefined,
      end: undefined,
    },
    powerNumber: undefined,
    dob: undefined,
    sortBy: 'recently-added',
    pageNumber: 1
  }
  constructor(
    private modalController: ModalController,
    private agencyService: AgencyService,
    public userStore: UserStore,

    ) { }

  ngOnInit() {
    this.filters = this.filtersData;
    this.filters.pageNumber = 1;
  }
  async closeModal(){
    await this.modalController.dismiss();
  }
  getSubAgencies(){
    if (this.userStore.getUser().agency.parentAgency) {
      this.agencyService
      .getSubAgencies({
        parentAgencyId: this.userStore.getUser().agencyId
      })
      .subscribe(subAgencies => {
        this.subAgencies = subAgencies;
      })
    }
  }

 async search(){
    await this.modalController.dismiss(this.filters);

  }

  async close(){
    await this.modalController.dismiss();
  }

}
