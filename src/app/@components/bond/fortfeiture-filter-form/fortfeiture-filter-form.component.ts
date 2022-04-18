import { Component, OnInit, ViewChild, Output, EventEmitter, AfterViewInit, Input, ElementRef } from '@angular/core';
import { NgForm } from '@angular/forms';
import { UserStore } from '../../../@store/user.store';
import { CourtsService } from '../../../services/courts.service';
import { BondsService } from '../../../services/bonds.service';
import { StaffService } from '../../../services/staff.service';
import {ModalController } from '@ionic/angular';
const moment = require('moment');

@Component({
  selector: 'app-fortfeiture-filter-form',
  templateUrl: './fortfeiture-filter-form.component.html',
  styleUrls: ['./fortfeiture-filter-form.component.scss'],
})
export class FortfeitureFilterFormComponent implements OnInit {
  @Input() filtersData;
  @Output() setAddress: EventEmitter<any> = new EventEmitter();
  @Output() filterData: EventEmitter<any> = new EventEmitter();
 
  subAgencies = [];
  bonds = {
    data: [],
    meta: {}
  }
  stats = {
    totalForfeitures: 0,
    openForfeitureLiability: 0,
    openForfeitures: 0,
    closedForfeitures: 0,
    reinstatedForfeitures: 0,
    activeForfeitures: 0,
    releasedForfeitures: 0
  }
  filters = {
    agencyId: undefined,
    defendantName: undefined,
    agentId: undefined,
    fortDate: {
      start: undefined,
      end: undefined
    },
    state: undefined,
    county: undefined,
    courtId: undefined,
    status: 'opened',
    pageNumber: 1
  }
  states = [];
  counties = [];
  courts = [];
  staffMembers = {
    data: [],
    meta: {}
  }
  constructor(
    public userStore: UserStore,
    private courtService: CourtsService,
    private bondsService: BondsService,
    private staffService: StaffService,
    private modalController: ModalController,



  ) { }

  ngOnInit() {
    this.getStates();
    this.getStaff();
    this.filters = this.filtersData;

  }
  async closeModal(){
    await this.modalController.dismiss();
  }
  getStates(){
    this.states = this.userStore.getStates();
    this.filters.state = this.userStore.getAgency().state;
    this.getCounties();
  
  }

  getCounties(){
    this.counties = this.userStore.getCountiesByState(this.filters.state);
    
  }
  search(){
    this.modalController.dismiss(this.filters);
    // let params: any = {
    //   agencyId: this.filters.agencyId,
    //   defendantName: this.filters.defendantName,
    //   courtId: this.filters.courtId,
    //   filingAgentId: this.filters.agentId,
    //   state: this.filters.state,
    //   county: this.filters.county,
    //   forfeitureStatus: this.filters.status,
    //   pageNumber: this.filters.page,
    //   pageSize: 30,
    // }

    // if (this.filters.status === 'opened') {
    //   params.exoneration = {
    //     $exists: false
    //   }
    // }

    // if(this.filters.fortDate){
    //   params.forfeitureDate = {}
    //   if (this.filters.fortDate.start) {
    //     params.forfeitureDate.start = moment(this.filters.fortDate.start).format('YYYY-MM-DDT23:59:00.000');
    //   }
    //   if (this.filters.fortDate.end) {
    //     params.forfeitureDate.end = moment(this.filters.fortDate.end).utc().format('YYYY-MM-DDT23:59:00.000');
    //   }
    // }
    // this.filterData.emit(this.filters);
    // this.getForfeitedBonds(params);
    // this.getStats(params)
  }
  getStats(params = null){
    delete params.pageSize;
    delete params.pageNumber;
    
  
    this.bondsService
    .getBondsStats({
      ...params,
      agencyId: this.userStore.getUser().agencyId
    })
    .subscribe(
      stats => {
        this.stats = stats.length > 0 ? stats[0]: this.stats;
            
      },
      errors => {
        
      }
    );
  }
  onAgencyChange(){
    this.getStaff();
  }

  getStaff(){
    this.staffService
    .getStaffMembers({
      agencyId: this.filters.agencyId,
      sortBy: 'name.first',
      orderBy: 'ASC',
      blocked: false
    })
    .subscribe(
      members => {
        this.staffMembers = members;
      }
    )
  }
  getForfeitedBonds(params = null){
    this.bonds.data = [];
    this.bondsService
    .getBonds({
      ...params,
      forfeiture: {
        $exists: true
      },
      sortBy: 'bonds.forfeiture.satisfyDate',
      orderBy: 'ASC',
      platform: {
        $ne: 'captira-legacy'
      }
    })
    .subscribe(
      bonds => {
        this.bonds = bonds;
        this.bonds.data.forEach(def => {
          def.monitoringCheck = def.monitoring && def.monitoring.status === 'enabled' ? true : false
        })
      errors => {
        //this.spinner = false;
      }
    }
    )
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
}
