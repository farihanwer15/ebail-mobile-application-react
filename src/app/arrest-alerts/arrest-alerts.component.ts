import { Component, OnInit } from '@angular/core';
import { UserStore } from 'src/app/@store/user.store';
import { BondsService } from '../services/bonds.service';
import { OfficeService } from '../services/office.service';
import { StaffService } from '../services/staff.service';
import { ActionSheetController, ModalController, AlertController, LoadingController, ToastController } from '@ionic/angular';

import * as _ from 'lodash';
import { DefendantsService } from '../services/defendants.service';
import { MonitoringService } from '../services/monotering.service';

@Component({
  selector: 'app-arrest-alerts',
  templateUrl: './arrest-alerts.component.html',
  styleUrls: ['./arrest-alerts.component.scss'],
})
export class ArrestAlertsComponent implements OnInit {
  defendants = [];

  stats = {
    arrestAlertsEnabled: 0,
    arrestAlertsDisabled: 0,
    neverMonitored: 0,
    totalDefendants: 0
  }
  
  filter = {
    officeId: undefined,
    agentId: undefined,
    defName: undefined,
    status: 'enabled',
    orderDate: {
      start: undefined,
      end: undefined,
    },
    defApp: 'all',
    page: 1,
    pageSize:'10'
  }

  offices = {
    data: [],
    meta: {}
  };

  staffMembers = [];
  constructor(
    private defService: DefendantsService,
    public userStore: UserStore,
    private officesService: OfficeService,
    private staffService: StaffService,
    public alertController: AlertController, 
    private loadingController: LoadingController, 
    private monitoringService:MonitoringService
  ) { }

  ngOnInit() {

    // this.filter.orderDate = {
    //   start: moment().subtract(30, 'days'),
    //   end: moment()
    // }

    this.onSubmit();
    this.getOffices();
    this.getStaffMembers();
  }

 async generateReport(params = null, apend){
    const loading = await this.loadingController.create({
      message: 'Please wait...'
    });
    await loading.present();
   // this.defendants = [];
    this.defService
    .getDefendants(params)
    .subscribe(
     async defs => {
        await loading.dismiss();
        console.log('defs', defs)

        defs.data&& defs.data.forEach(def => {
          def.monitoringCheck = def.monitoring && def.monitoring.status === 'enabled' ? true : false;
          def.inCustody = def.custody && def.custody.status === 'enabled' ? true : false;
        })
        console.log('append',apend)
        if (apend) {
          console.log('1',this.defendants)
          this.defendants = _.concat(this.defendants,defs.data);  
          console.log('12',this.defendants)
        } else {
          this.defendants = defs.data;
        }

        
      },
     async errors => {
        await loading.dismiss();
      }
    );
  }
  
  getStats(params = null){
   
    this.defService
    .getDefendantsStats(params)
    .subscribe(
      stats => {
        this.stats = stats.length > 0 ? stats[0]: this.stats;
       
      },
      errors => {
        
      }
    );
  }

  getOffices(){
    this.officesService
    .getOffices({
      agencyId: this.userStore.getUser().agencyId
    })
    .subscribe(
      offices => {
        this.offices = offices;
      }
    )
  }

  getStaffMembers(){
    this.staffService
    .getStaffMembers({
      agencyId: this.userStore.getUser().agencyId,
      sortBy: 'name.first',
      orderBy: 'ASC',
      blocked: false
    })
    .subscribe(
      members => {
        this.staffMembers = members.data;
      }
    )
  }

  onSubmit(apend?){
    let params:any = {
      name: this.filter.defName,
      agencyId: this.userStore.getUser().agencyId,
      pageNumber: this.filter.page,
      pageSize: this.filter.pageSize,
      orderBy: 'DESC',
      sortBy: 'monitoring.updatedAt',
      monitoringStatus: this.filter.status,
      project: {
        _id: 1,
        name: 1,
        monitoring: 1,
        agencyId: 1,
        postingAgent: 1,
        dob: 1,
        custody: 1
      }
    };

    if(this.filter.agentId){
      params.postingAgentId = this.filter.agentId;
    }
    if (this.filter.officeId) {
      params.officeId = this.filter.officeId
    }

    if(this.filter.orderDate){
      params.orderDate = {}
      if (this.filter.orderDate.start) {
        params.orderDate.start = new Date(this.filter.orderDate.start);
      }
      if (this.filter.orderDate.end) {
        params.orderDate.end = new Date(this.filter.orderDate.end);
      }
    }

    this.generateReport(params,apend);
    this.getStats({
      agencyId: this.userStore.getUser().agencyId,
    });
  }
  onMenuItemSelected(event){
    this.onSubmit()
  
  }
  resetFilter(){
    this.filter = {
       officeId: undefined,
       agentId: undefined,
       defName: undefined,
      status: 'enabled',
      orderDate: {
      start: undefined,
      end: undefined,
    },
    defApp: 'all',
    page: 1,
    pageSize:'25'
    };
    this.onSubmit();
    // this.getStats();
  }



  previousPage(){
    if (this.filter.page > 1) {
      this.filter.page--;
      this.onSubmit();
    }
  }

  nextPage(){
    this.filter.page++;
    this.onSubmit();
  }

  loadData(event) {
    
    this.filter.page++
    this.onSubmit(true);
    //this.getDefendants(true);
    setTimeout(() => {
      event.target.complete();
    }, 500);
  }

  
  onMonitoringToggle(def){
    const toggleValue = !def.monitoringCheck
    console.log('toggle', toggleValue)
    if (toggleValue) {
      this.startMonitoring(def)
    }
    else if (def.monitoring.monitoringId) {
      this.cancelOrder(def, def.monitoring.monitoringId)
    }
  }
  async startMonitoring(def){
    const alert = await this.alertController.create({
      header: 'Confirm!',
      message: 'By turning on "Arrest Alert" you will be charged $0.75/mo. You can view all people being monitored here. Charges will be applied to your monthly payment.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: async () => {
            def.monitoringCheck = !def.monitoringCheck;
  
          }
        }, 
        {
          text: 'Yes',
          handler: async () => {

            const loading = await this.loadingController.create({
              message: 'Please wait...'
            });
            await loading.present();
    
            this.defService.startMonitoring(def._id)
            .subscribe(
              async () => {
                this.onSubmit();
                await loading.dismiss();
              },
              async errors => {
                console.log(errors);
                
                await loading.dismiss();
              }
            );
            
          }
        }
      ]
    });

    await alert.present();
  }
  async cancelOrder(def,monitoringId){
    const alert = await this.alertController.create({
      header: 'Confirm!',
      message: 'Are you sure you want to stop monitoring this defendant?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: async () => {
             def.monitoringCheck = !def.monitoringCheck
           
          }
        }, 
        {
          text: 'Yes',
          handler: async () => {

            const loading = await this.loadingController.create({
              message: 'Please wait...'
            });
            await loading.present();
    
            this.monitoringService.cancelOrder(monitoringId, def._id)
            .subscribe(
              async () => {
                this.onSubmit();
                await loading.dismiss();
              },
              async errors => {
                console.log(errors);
                
                await loading.dismiss();
              }
            );
            
          }
        }
      ]
    });

    await alert.present();
  }

  // startMonitoring(def){

  //   this.dialogService.open(ConfirmationDialogComponent, {
  //     context: {
  //       text: 'By turning on "Arrest Alert" you will be charged $0.75/mo. You can view all people being monitored here. Charges will be applied to your monthly payment.'
  //     }
  //   })
  //   .onClose.subscribe(
  //     confirm => {
  //       if (confirm) {
  //         this.dataSpinner = true; 
  //         this.defService.startMonitoring(def._id)
  //         .subscribe(res => {
  //           this.dataSpinner = false;
      
  //           this.onSubmit();
  //         },
  //         err => {
  //           console.log(err);
  //           this.dataSpinner = false;
  //         })
  //       }
  //       else {
  //         def.monitoringCheck = false;
  //       }
  //     }
  //   );
  // }

  // cancelOrder(def, monitoringId){
  //   this.dialogService.open(ConfirmationDialogComponent, {
  //     context: {
  //       text: 'Are you sure you want to stop monitoring this defendant?'
  //     }
  //   })
  //   .onClose.subscribe(
  //     confirm => {
  //       if (confirm) {
  //         this.dataSpinner = true;
  //         this.monitoringService.cancelOrder(monitoringId, def._id)
  //         .subscribe(
  //           () => {
  //             this.onSubmit();
  //             this.toastrService.show('', 'Defendant monitoring stopped successfully.', {
  //               status: 'success',
  //               position: NbGlobalPhysicalPosition.TOP_LEFT
  //             });
  //             this.dataSpinner = false;
  //           },
  //           errors => {
  //             console.log(errors);
  //             this.dataSpinner = false;
  //           }
  //         );  
  //       }
  //       else {
  //         def.monitoringCheck = true;
  //       }
  //     }
  //   );
  // }

  async onCustodyToggle(def){
    const toggleValue = !def.inCustody
    let message = 'Are you sure you want to mark this defendant "In Custody"?';
    if (!toggleValue) {
      message = 'Are you sure you want to remove "In Custody" status from this defendant?'
    }

    const alert = await this.alertController.create({
      header: 'Confirm!',
      message: message,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: async () => {
            def.inCustody = !def.inCustody
          }
        }, 
        {
          text: 'Yes',
          handler: async () => {

            const loading = await this.loadingController.create({
              message: 'Please wait...'
            });
            await loading.present();
    
            this.defService.updateCustodyStatus({
              defendantId: def._id,
              status:toggleValue ? 'enabled' : 'disabled'
            })
            .subscribe(
              async () => {
                this.defService.defendantAdded(null);
                
                // const toast = await this.toastController.create({
                //   color: 'success',
                //   duration: 3000,
                //   message: 'Collateral has been deleted successfully.',
                //   showCloseButton: true,
                //   position: 'top'
                // });
                // await toast.present();
                await loading.dismiss();
              },
              async errors => {
                console.log(errors);
                
                await loading.dismiss();
              }
            );
            
          }
        }
      ]
    });

    await alert.present();
  }
 

  // fix(){
  //   this.monitoringService.fix().subscribe();
  // }

}
