import { Component, OnInit } from '@angular/core';
import { DefendantsService } from '../services/defendants.service';
import { UserStore } from '../@store/user.store';
import { LoadingController, ModalController } from '@ionic/angular';
import { AgencyService } from '../services/agency.service';
const moment = require('moment');
import { Subscription } from 'rxjs';

import * as _ from 'lodash';
import { DefendantQuickFormComponent } from '../@components/defendant/defendant-quick-form/defendant-quick-form.component';
import { DefendantFilterFormComponent } from '../@components/bond/defendant-filter-form/defendant-filter-form.component';
@Component({
  selector: 'app-defendants',
  templateUrl: './defendants.page.html',
  styleUrls: ['./defendants.page.scss'],
})
export class DefendantsPage implements OnInit {

  defendants = {
    data: [],
    meta: {}
  }

  filters = {
    agencyId: undefined,
    name: undefined,
    status: undefined,
    monitoringStatus : undefined,
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
  subAgencies = [];

  private defendantFormSubscription: Subscription;

  constructor(
    private defService: DefendantsService,
    private userStore: UserStore,
    private loadingController: LoadingController,
    private modalController: ModalController,
    private agencyService: AgencyService

  ) {}

  loadData(event) {
    
    this.filters.pageNumber++;
    this.search(true)
    //this.getDefendants(true);
    setTimeout(() => {
      event.target.complete();
    }, 500);
  }

  ngOnInit() {
    //this.getDefendants();
    this.initEvents()
    this.search();
  }
  initEvents(){
    this.defendantFormSubscription = this.defService.defendantAdded$.subscribe(
      data => {
        this.filters.pageNumber = 1
        this.search();
      }
    )
  }
  search(apend?){

    let postingAgentId = undefined;
    if (this.userStore.getUser().privileges && !this.userStore.getUser().privileges.allDefendantsAccess) {
      postingAgentId = this.userStore.getUser().id;
    }

    console.log('this.filters.monitoringStatus', this.filters.monitoringStatus);
    
    let params: any = {
      name: this.filters.name,
      powerNumber: this.filters.powerNumber,
      pageNumber: this.filters.pageNumber,
      monitoringStatus : this.filters.monitoringStatus,
      pageSize: 10,
      orderBy: 'DESC',
      sortBy: 'createdAt',
      postingAgentId: postingAgentId,
      dob: this.filters.dob ? moment(this.filters.dob).format('MM/DD/YYYY') : undefined,
      latestBond: true,
      project: {
        _id: 1,
        agencyId: 1,
        name: 1,
        declinedAt: 1,
        onBoardedAt: 1,
        "postingAgent.name": 1,
        "postingAgent._id": 1,
        email: 1,
        contacts: 1,
        createdAt: 1,
        prospectInterest: 1,
        deceasedAt : 1,
        deceasedBy  :1,
        dob: 1,
        monitoring: 1,
        monitoringId: 1,
        "latestBond.bondDate": 1,
        "latestBond._id": 1,
        source: 1,
        voidedAt: 1
      }
    }

    if (this.filters.sortBy === 'recently-added-bond') {
      params.sortBy = 'latestBond.bondDate'
    }

    if(this.filters.status === 'on-boarded'){
      params.onBoardedAt =  {
        $exists: true
      }
    }
    else if(this.filters.status === 'prospect'){
      params.onBoardedAt = {
        $exists: false
      }
    }
    else if(this.filters.status === 'declined'){
      params.declinedAt = {
        $exists: true
      }
    }

    if(this.filters.createdAt){
      params.createdAt = {}
      if (this.filters.createdAt.start) {
        params.createdAt.start = moment(this.filters.createdAt.start).format('MM/DD/YYYY');
      }
      if (this.filters.createdAt.end) {
        params.createdAt.end = moment(this.filters.createdAt.end).format('MM/DD/YYYY');
      }
    }

    this.listDefendants(params,apend);
  }
 async listDefendants(params = null, apend){
    //this.defendants.data = [];
    const loading = await this.loadingController.create();
    await loading.present();
    
    this.defService.getDefendants({
      ...params,
      agencyId: this.userStore.getUser().agencyId
    })
    .subscribe(
    async defendants => {
        await loading.dismiss();

        defendants.data.forEach(def => {
          def.phone = _.result(_.find(def.contacts, (contact) => {
            return contact.key === 'Phone';
          }), 'value');

          if(!def.phone){
            def.phone = _.result(_.find(def.contacts, (contact) => {
              return contact.key === 'Mobile';
            }), 'value');
          }

          const defApp = _.find(def.documents, doc => {
            return doc.type === 'Defendant Application'
          });
          if(defApp){
            def.appUploaded = true;
          }

          def.monitoringCheck = def.monitoring && def.monitoring.status === 'enabled' ? true : false
  
        });
        if (apend) {
          this.defendants.data = _.concat(this.defendants.data, defendants.data);  
        } else {
          this.defendants = defendants;
        }
      },
     async error => {
        console.log(error);
        await loading.dismiss();
      }
    )
  }
  etSubAgencies(){
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
  async openFilterModal(){
    const modal = await this.modalController.create({
      component: DefendantFilterFormComponent,
      componentProps: {
        filtersData:this.filters
      }
    });
    modal.onDidDismiss()
    .then((data) => {
      if(data.data){
        this.filters = data.data
        this.search()
        // this.search(data.data)

      }
    
  });
    (await modal).present();
  }

  async getDefendants(append = false){

    const loading = await this.loadingController.create({
      message: 'Please wait...',
    });

    await loading.present();
    
    let postingAgentId = undefined;
    if (!this.userStore.getUser().privileges.allDefendantsAccess) {
      postingAgentId = this.userStore.getUser().id;
    }
    
    this.defService.getDefendants({
      ...this.filters,
      agencyId: this.userStore.getUser().agencyId,
      pageSize: 30,
      orderBy: 'DESC',
      sortBy: 'createdAt',
      postingAgentId: postingAgentId,
      project: {
        _id: 1,
        agencyId: 1,
        name: 1,
        declinedAt: 1,
        onBoardedAt: 1,
        "postingAgent.name": 1,
        "postingAgent._id": 1,
        email: 1,
        contacts: 1,
        createdAt: 1,
        prospectInterest: 1,
        deceasedAt : 1,
        deceasedBy  :1,
        dob: 1,
        monitoring: 1,
        monitoringId: 1,
        impNote: 1,
        "latestBond.bondDate": 1,
        "latestBond._id": 1,
        source: 1,
        voidedAt: 1,
        BookNumber: 1
      }
    })
    .subscribe(
      defendants => {

        if (append) {
          this.defendants.data = _.concat(this.defendants.data, defendants.data);  
        } else {
          this.defendants = defendants;
        }
        loading.dismiss();
      },
      error => {
        console.log(error);
        loading.dismiss();
      }
    )
  }

  getPhone(defendant){
    let phone = '';
    if(defendant){
      phone = _.result(_.find(defendant.contacts, (contact) => {
        return contact.key === 'Phone';
      }), 'value');
    }

    return phone;
  }

  onSearchInput(event){
    this.filters.name = event.target.value;
    this.filters.pageNumber = 1;
    if (this.filters.name.length < 3 && this.filters.name.length > 0) {
      return;
    }
    //this.getDefendants();
  }

  async openAddDefendantModal() {
    const modal = await this.modalController.create({
      component: DefendantQuickFormComponent,
    });

    await modal.present();

    modal.onDidDismiss().then((data) => {
      this.getDefendants();
    });
  }
  ngOnDestroy(){
    this.defendantFormSubscription.unsubscribe();
  }

}
