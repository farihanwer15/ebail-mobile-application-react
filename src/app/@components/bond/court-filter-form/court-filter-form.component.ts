import { Component, OnInit,Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { UserStore } from '../../../@store/user.store';
import { StaffService } from '../../../services/staff.service';
import { AgencyService } from '../../../services/agency.service';
import { CourtsService } from '../../../services/courts.service';


@Component({
  selector: 'app-court-filter-form',
  templateUrl: './court-filter-form.component.html',
  styleUrls: ['./court-filter-form.component.scss'],
})
export class CourtFilterFormComponent implements OnInit {
  @Input() filtersData;

  filters = {
    agencyId: undefined,
    defendantName: undefined,
    agentId: undefined,
    // courtDate: undefined,
    courtDate: {
      start: undefined,
      end: undefined,
    },
    state: undefined,
    county: undefined,
    courtId: undefined,
    status: '',
    page: 1,
    inlcludeRevoked: false
  }
  staffMembers = {
    data: [],
    meta: {}
  }
  states = [];
  subAgencies = [];
  counties = [];
  courts = [];

  constructor(
    private modalController: ModalController,
    public userStore: UserStore,
    private staffService: StaffService,
    private agencyService: AgencyService,
    private courtService: CourtsService,
    ) { }

  ngOnInit() {
    this.filters.agencyId = this.userStore.getUser().agencyId;
    this.getStaff();
    this.getStates();
    this.getSubAgencies();
    this.filters = this.filtersData;
  }

  onAgencyChange(){
    this.getStaff();
  }
  getCourts(){
    
    this.courtService.getCourts({
      county: this.filters.county
    })
    .subscribe(
      courts => {
        this.courts = courts.data;
      }
    )
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
  getStates(){
    this.states = this.userStore.getStates();
  }
  getCounties(){
    this.counties = this.userStore.getCountiesByState(this.filters.state);
  }
  getStaff(){
    this.staffService
    .getStaffMembers({
      agencyId: this.filters.agencyId,
      sortBy: 'name.first',
      orderBy: 'ASC',
    })
    .subscribe(
      members => {
        this.staffMembers = members;
      }
    )
  }
  async closeModal(){
    await this.modalController.dismiss();
  }
  

  async search(){
    await this.modalController.dismiss(this.filters);
  }
}
