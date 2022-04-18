import { Component, OnInit } from '@angular/core';
import { PowersService } from '../services/powers.service';
import { UserStore } from '../@store/user.store';
import { LoadingController, ModalController, ToastController, AlertController } from '@ionic/angular';
import { PowerFilterFormComponent } from '../@components/bond/power-filter-form/power-filter-form.component'
import { AddPowerFormComponent } from '../@components/bond/add-power-form/add-power-form.component';
import { Subscription } from 'rxjs';

import * as _ from 'lodash';
import * as moment from 'moment';

@Component({
  selector: 'app-powers',
  templateUrl: './powers.page.html',
  styleUrls: ['./powers.page.scss'],
})
export class PowersPage implements OnInit {
  private powerSubscription: Subscription;

  powers = {
    data: [],
    meta: {}
  }

  waitingPowers = {
    data: [],
    meta: {}
  }

  segment = 'powers';
  loading;

  sortFilters = {
    sortBy: 'number',
    orderBy: 'ASC'
  }

  filters = {
    defendantName: undefined,
    agentId: undefined,
    prefixId: undefined,
    suretyId: undefined,
    powerNumbers: undefined,
    status: undefined,
    pageNumber: 1,
    orderBy: 'ASC',
    sortBy: 'number',
  }

  constructor(
    private powersService: PowersService,
    private userStore: UserStore,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private alertController: AlertController,
    private modalController: ModalController
  ) { }

  loadData(event) {
    this.filters.pageNumber++;
    setTimeout(() => {
      this.search(true)

      //this.getAgentPowers(true)
      event.target.complete();
    }, 500);
  }

  ngOnInit() {
    this.search()
    // this.getAgentPowers();
    this.getWaitingPowers();
    this.initEvents()
  }
  initEvents() {
    this.powerSubscription = this.powersService.powerAdded$.subscribe(
      data => {
        console.log('PAWOOr')
        this.search();

      }
    );
  }

  async openFilterModal() {
    const modal = await this.modalController.create({
      component: PowerFilterFormComponent,
      componentProps: {
        filtersData: this.filters
      }
    });
    modal.onDidDismiss()
      .then((data) => {
        if (data.data) {
          this.filters = data.data
          this.search()
        }
      });
    (await modal).present();
  }

  search(apend?) {
    let params: any = {
      defendantName: this.filters.defendantName,
      powerNumber: this.filters.powerNumbers,
      assignedAgentId: this.filters.agentId,
      prefixId: this.filters.prefixId,
      pageNumber: this.filters.pageNumber,
      pageSize: 30,
      orderBy: this.filters.orderBy,
      sortBy: this.filters.sortBy
    }

    if (this.filters.status === 'available') {
      params.assignedAgentId = {
        $exists: false
      }
      params.voidedAt = {
        $exists: false
      }
    }
    else if (this.filters.status === 'assigned') {
      params.agentAcceptedAt = {
        $exists: true
      }
      params.executedAt = {
        $exists: false
      }
      params.voidedAt = {
        $exists: false
      }
    }
    else if (this.filters.status === 'executed') {
      params.executedAt = {
        $exists: true
      }
      params.voidedAt = {
        $exists: false
      }
    }
    else if (this.filters.status === 'voided') {
      params.voidedAt = {
        $exists: true
      }
    }
    else if (this.filters.status === 'waiting') {
      if (!params.assignedAgentId) {
        params.assignedAgentId = {
          $exists: true
        }
      }
      params.agentAcceptedAt = {
        $exists: false
      }
      params.voidedAt = {
        $exists: false
      }
    }
    else if (this.filters.status === 'expiring-soon') {
      params.sortBy = 'expiryDate';
      params.orderBy = 'DESC'
      params.executedAt = {
        $exists: false
      }
      params.voidedAt = {
        $exists: false
      }
      params.expiryDate = {
        // start: moment().utc().format('YYYY-MM-DDT23:59:00.000'),
        end: moment().add(60, 'days').utc().format('YYYY-MM-DDT23:59:00.000')
      }
    }
    else if (this.filters.status === 'unused-expired') {
      params.sortBy = 'expiryDate';
      params.orderBy = 'DESC'
      params.executedAt = {
        $exists: false
      }
      params.expiryDate = {
        // start: moment().utc().format('YYYY-MM-DDT23:59:00.000'),
        end: moment().utc().format('YYYY-MM-DDT23:59:00.000')
      }
    }
    this.listPowers(params, apend);
  }

  async listPowers(params = null, apend?) {
    const loading = await this.loadingController.create();
    await loading.present();
    //this.powers.data = [];
    this.powersService
      .getPowers({
        ...params,
        agencyId: this.userStore.getUser().agencyId,
        project: {
          "assignedStaffMember.latestBond": 0,
          "assignedStaffMember.loginHistory": 0,
          "assignedStaffMember.latestBondReceipts": 0,
        }
      })
      .subscribe(
        async powers => {
          await loading.dismiss();
          if (apend) {
            this.powers.data = _.concat(this.powers.data, powers.data);
          } else {
            this.powers = powers;
          }
        },
        async error => {
          await loading.dismiss();
          console.log(error)
        })
  }

  segmentChanged(segment) {
    this.segment = segment.detail.value;
    if (this.segment === 'waiting') {
      this.getWaitingPowers();
    }
    else {
      this.getAgentPowers();
    }
  }

  async getAgentPowers(append = false) {
    const loading = await this.loadingController.create({
      message: 'Please wait...',
    });
    await loading.present();
    this.powersService
      .getPowers({
        assignedAgentId: this.userStore.getUser().id,
        agentAcceptedAt: {
          $exists: true
        },
        powerNumber: this.filters.powerNumbers,
        pageSize: 30,
        pageNumber: this.filters.pageNumber
      })
      .subscribe(
        powers => {
          if (append) {
            this.powers.data = _.concat(this.powers.data, powers.data);
          } else {
            this.powers = powers;
          }
          loading.dismiss();
        },
        error => {
          loading.dismiss();
        })
  }

  async getWaitingPowers() {
    const loading = await this.loadingController.create({
      message: 'Please wait...',
    });
    await loading.present();
    this.powersService
      .getPowers({
        ...this.sortFilters,
        assignedAgentId: this.userStore.getUser().id,
        agentAcceptedAt: {
          $exists: false
        }
      })
      .subscribe(
        powers => {
          this.waitingPowers = powers;
          loading.dismiss();
        },
        error => {
          loading.dismiss();
        })
  }

  async acceptPower(power) {
    const loading = await this.loadingController.create({
      message: 'Please wait...',
    });
    await loading.present();

    this.powersService
      .updatePower(power._id, {
        agentAcceptedAt: new Date()
      })
      .subscribe(
        async power => {
          this.getWaitingPowers();
          const toast = await this.toastController.create({
            message: 'You have successfully accepted the power.',
            color: 'success',
            duration: 3000,
            position: 'top'
          });
          toast.present();
          loading.dismiss();
        },
        error => {
          loading.dismiss();
        })
  }

  onSearchInput(event) {
    this.filters.powerNumbers = event.target.value;
    this.filters.pageNumber = 1;
    this.getAgentPowers();
  }

  async acceptAllPowers() {
    const alert = await this.alertController
      .create({
        header: 'Warning',
        message: `By accepting all powers you agree to "${this.userStore.getUser().agency.dba}" terms and conditions.`,
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            cssClass: 'secondary',
            handler: (blah) => {
            }
          }, {
            text: 'Okay',
            handler: async () => {
              let powerIds = [];
              this.waitingPowers.data.forEach(power => {
                powerIds.push(power._id);
              });
              const loading = await this.loadingController.create({
                message: 'Please wait...',
              });
              await loading.present();
              this.powersService
                .acceptMultiplePowers(powerIds)
                .subscribe(
                  async () => {
                    this.getWaitingPowers();
                    const toast = await this.toastController.create({
                      message: 'All powers has been successfully accepted.',
                      color: 'success',
                      duration: 3000,
                      position: 'top'
                    });
                    await toast.present();
                    await loading.dismiss();
                  },
                  async errors => {
                    await loading.dismiss();
                  })
            }
          }]
      });
    await alert.present();
  }

  async addPowerForm() {
    const modal = await this.modalController.create({
      component: AddPowerFormComponent,
    });
    (await modal).present();
  }

  ngOnDestroy() {
    this.powerSubscription.unsubscribe();
  }

}
