import { Component, OnInit, AfterViewInit,RendererFactory2, Inject,Renderer2 } from "@angular/core";
import { LoadingController, ModalController } from "@ionic/angular";
import { BondsService } from "../services/bonds.service";
import { AgencyService } from "../services/agency.service";
  import { UserStore } from "../@store/user.store";

import * as moment from "moment";
import * as _ from "lodash";
import { DefendantQuickFormComponent } from "../@components/defendant/defendant-quick-form/defendant-quick-form.component";
import { Router } from "@angular/router";
import { ImageCropperComponent } from "../@components/image-cropper/image-cropper.component";
import { DocumentUploaderComponent } from "../@components/document-uploader/document-uploader.component";
import { TasksService } from '../services/tasks.service';
import { AppService } from '../services/app.service';
import { AuthService } from '../services/auth.service';
import { PowersService } from '../services/powers.service';
import { CourtDatesService } from '../services/court-dates.service';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: "app-home",
  templateUrl: "home.page.html",
  styleUrls: ["home.page.scss"],
})
export class HomePage implements OnInit, AfterViewInit {
  image;
  darkMode
  renderer: Renderer2;

  stats = {
    activeBonds: 0,
    totalBonds: 0,
    forfeitureBonds: 0,
    activeForfeitures: 0,
    totalLiability: 0,
    openLiability: 0,
    forfeitureLiability: 0,
    openForfeitureLiability: 0,
    totalBondsThisMonth: 0,
    totalPremiumAmount: 0,
    defendants: [],
    activeCases: 0,
    casesClosedThisMonth: 0,
    caseRequests: 0
  };

  tasks = [];
  forfeitureBonds = [];

  initChart = false;
  powers = [];
  powersTotal = 0;
  nextCourtDate = undefined;
  upcomingCourtDates = [];
  segment = 'court-dates'
  // public barChartLabels: string[] = ['June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
  public barChartLabels = [];
  public barChartType: string = "bar";
  public barChartLegend: boolean = true;

  public barChartData: any[] = [
    {
      data: [0, 0, 0, 0, 0, 0, 0],
      label: "Created Bonds",
      borderColor: "#3366ff",
      pointBackgroundColor: "#3366ff",
      fill: false
      // backgroundColor: "#06768f",
    },
    {
      data: [0, 0, 0, 0, 0, 0, 0],
      label: "Posted Bonds",
      borderColor: "#00d68f",
      pointBackgroundColor: "#00d68f",
      fill: false
      // backgroundColor: "#069BFE",
    },
    {
      data: [0, 0, 0, 0, 0, 0, 0],
      label: "Forfeitures",
      borderColor: "#ff3d71",
      pointBackgroundColor: "#ff3d71",
      fill: false
      // backgroundColor: "#069BFE",
    },
    {
      data: [0, 0, 0, 0, 0, 0, 0],
      label: "Discharges",
      borderColor: "#00bcd4",
      pointBackgroundColor: "#00bcd4",
      fill: false
      // backgroundColor: "#069BFE",
    },
  ];

  license =
    "eyJzY29wZSI6WyJBTEwiXSwicGxhdGZvcm0iOlsiaU9TIiwiQW5kcm9pZCIsIldpbmRvd3MiLCJKUyIsIldlYiJdLCJ2YWxpZCI6IjIwMjAtMDctMDQiLCJtYWpvclZlcnNpb24iOjMsIm1heERheXNOb3RSZXBvcnRlZCI6NSwic2hvd1dhdGVybWFyayI6dHJ1ZSwicGluZ1JlcG9ydGluZyI6dHJ1ZSwiZGVidWdSZXBvcnRpbmciOiJvcHQtb3V0IiwidG9sZXJhbmNlRGF5cyI6NSwic2hvd1BvcFVwQWZ0ZXJFeHBpcnkiOnRydWUsImlvc0lkZW50aWZpZXIiOlsiaHR0cHM6Ly9lYmFpbC5hcHAiXSwiYW5kcm9pZElkZW50aWZpZXIiOlsiaHR0cHM6Ly9lYmFpbC5hcHAiXSwid2luZG93c0lkZW50aWZpZXIiOlsiaHR0cHM6Ly9lYmFpbC5hcHAiXSwid2ViSWRlbnRpZmllciI6WyJodHRwczovL2ViYWlsLmFwcCJdLCJqc0lkZW50aWZpZXIiOlsiaHR0cHM6Ly9lYmFpbC5hcHAiXSwiaW1hZ2VSZXBvcnRDYWNoaW5nIjp0cnVlfQp5bHBNbWRNWlc1TDlOMTlVelVjNVRreGQvTGFFWHkwYmU0cTZiM3ZURmRxOXlHMEY5OURQNEQ5dThZWDJVK3MyUE9GKzhMenhuNy9kVTNVeWN2MjJNS3ViUUlURUpWdW5rRlY2ck1POWt5TFlkVEZsL1RjVTFWb3RuTnlWdnZ3ZFRWcllxMWNoRFhqamlyNFF6VUgrb2pvekNrY2VHcS9URWUvREV6cmdHWkh6clFtUnVIMGRKVmZRck1TeGJJVUtHZVhHNndaUnVkM0JXdGdPM3VPRWVpSFplTXpZMGlVMnZDOXRjeGNqajdaVHA0dU95Q3NiOUJSdkQ5SVE2MTZpd1ByM2hWNE55UnVuOE94QWJBeUpPTXZzWS93RE41aVdqbkJlNkxmTGk0YUVqQWtTQlgrKzZXenI4L2pxdjhrKzdQNFlOVHR3cDNaWU9McWVoTkZ0WFE9PQ==";

  constructor(
    private modalController: ModalController,
    private bondsService: BondsService,
    private agencyService: AgencyService,
    public userStore: UserStore,
    private router: Router,
    private tasksService: TasksService,
    private loadingController: LoadingController,
    private authService: AuthService,
    private appService: AppService,
    private powerService: PowersService,
    private courtDatesService: CourtDatesService,
    private rendererFactory : RendererFactory2,
    @Inject(DOCUMENT)
    private document:Document
  ) {
    this.renderer = this.rendererFactory.createRenderer(null, null)
  }

  ngOnInit() {
    this.appService.getDarkMode().subscribe(res => {
      if (res) {
        
        this.renderer.addClass(this.document.body, 'dark-theme')
      } else {
        this.renderer.removeClass(this.document.body, 'dark-theme')
      }
    })
    this.getAgencyStats();
    this.getBondStats();
    this.getTasksData();
    this.getAgentPowers();
    this.getNextCourtDate();
    this.getBondStatsWithoutDate();
    this.getUpcomingCourtDates();
    // if(this.userStore.getUser().darkMode){
    //   this.renderer.addClass(this.document.body,'dark-theme')
    // }else{
    //   this.renderer.removeClass(this.document.body,'dark-theme')
    // }
    

  // // this.darkMode = this.userStore && this.userStore.getUser() && this.userStore.getUser().darkMode || false;
  
    

    if (this.userStore.getUser().roles.recoveryAgent) {
      this.barChartData = [
        {
          data: [0, 0, 0, 0, 0, 0, 0],
          label: "New Cases",
          // backgroundColor: "#ff1a1a",
          //borderColor: "#ff1a1a",
          //pointBackgroundColor: "#ff1a1a",
          fill: false
        },
        {
          data: [0, 0, 0, 0, 0, 0, 0],
          label: "Closed Cases",
          fill: false
          // backgroundColor: "#069BFE",
        },
      ];

      this.getRecoveryBondStats();
    }
  }

  ngAfterViewInit() {}

  async getAgencyStats() {
    const timezone = this.userStore.getAgency().timezone ? this.userStore.getAgency().timezone : '-0600';
    let format = 'ddd';
    if (this.userStore.getUser()) {
      const loading = await this.loadingController.create({
        message: 'Loading'
      });
      await loading.present();
      let today = moment();
      let endDate = today.format('MM/DD/YYYY');
      let startDate = today.subtract(6, 'days').format('MM/DD/YYYY');

      let params:any = {
        agencyId: this.userStore.getUser().agencyId,
        createdAt: {
          start: moment(startDate).utcOffset(timezone, true).toDate(),
          end: moment(endDate).utcOffset(timezone, true).toDate()
        },
        bondDate: {
          start: moment(startDate).utcOffset(timezone, true).toDate(),
          end: moment(endDate).utcOffset(timezone, true).toDate()
        },
        project: {
          _id: 1,
          'bonds.createdAt': 1,
          'bonds.bondDate': 1,
          'bonds.forfeiture': 1,
          'bonds.exoneration': 1,
          'bonds.executedAt': 1,
        },
        forfeitureDate: {
          start: startDate,
          end: endDate
        },
        dischargedDate: {
          start: startDate,
          end: endDate
        }
      }

      if (!this.userStore.getUser().roles.agencyOwner && !this.userStore.getUser().roles.agencyManager) {
        params.filingAgentId = this.userStore.getUser().id
      }

      this.bondsService.getRegularForfeitureBonds(params)
      // this.agencyService
      //   .getAgencyStats(this.userStore.getUser().agencyId, {
      //     agentId: !this.userStore.getUser().roles.agencyOwner && !this.userStore.getUser().roles.agencyManager ? this.userStore.getUser().id : undefined,
      //     startDate: moment().subtract(7, 'days').toDate(),
      //     endDate: moment().toDate()
      //   })
        .subscribe(async (stats) => {
          this.stats.defendants = stats.defendants;

          let postedBonds =_.groupBy(stats.postedBonds, (def) => {
            return moment(def.bonds.bondDate).utcOffset(timezone, true).format(format);
          });
          

          let createdBonds =_.groupBy(stats.bonds, (def) => {          
            return moment(def.bonds.createdAt).utcOffset(timezone, true).format(format);
          });

          let groupedForfeiture = _.groupBy(stats.fortBonds, (def) => {
            return moment(def.bonds.forfeiture.date).utcOffset(0).format(format);
          });

          let groupedDischarge = _.groupBy(stats.dischargedBonds, (def) => {
            return moment(def.bonds.exoneration.dischargedDate).utcOffset(0).format(format);
          });
          let xAxisLabels =[]
          const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
          let goBackDays = 7;
          let today = new Date();
          for (let i = 0; i < goBackDays; i++) {
            let newDate = new Date(today.setDate(today.getDate() - 1));
           this.barChartLabels.push(days[newDate.getDay()]);
          }
          this.barChartLabels.reverse()

          this.barChartLabels.forEach((label, index) => {

            if (createdBonds && createdBonds[label]) {
              this.barChartData[0].data[index] = createdBonds[label].length;
            }
            if (postedBonds && postedBonds[label]) {
              this.barChartData[1].data[index] = postedBonds[label].length;
            }

            if (groupedForfeiture && groupedForfeiture[label]) {
              this.barChartData[2].data[index] = groupedForfeiture[label].length;
            }

            if (groupedDischarge && groupedDischarge[label]) {
              this.barChartData[3].data[index] = groupedDischarge[label].length;
            }
          });

          this.initChart = true

          await loading.dismiss();
        },
        async err => {
          await loading.dismiss();
        });
    }
  }

  getBondStats() {
    if (this.userStore.getUser()) {
      this.bondsService
        .getBondsStats({
          filingAgentId: !this.userStore.getUser().roles.agencyOwner && !this.userStore.getUser().roles.agencyManager ? this.userStore.getUser().id : undefined,
          agencyId: this.userStore.getUser().agencyId,
          bondDate: {
            start: moment().startOf('month').toDate(),
            end: moment().toDate()
          }
        })
        .subscribe((bondStats) => {
          if (bondStats.length > 0) {
            bondStats = bondStats[0];

            this.stats.forfeitureBonds = bondStats.totalForfeitures;
            this.stats.totalBondsThisMonth = bondStats.totalBondsThisMonth;
            this.stats.activeForfeitures = bondStats.activeForfeitures,
            this.stats.totalPremiumAmount = bondStats.totalPremiumAmount
          }
        });
    }
  }

  getRecoveryBondStats() {
    if (this.userStore.getUser()) {
      this.bondsService
        .getRecoveryBondStats({
          recoveryAgentId: this.userStore.getUser().roles.recoveryAgent ? this.userStore.getUser().id : undefined,
          agencyId: this.userStore.getUser().agencyId,
          // bondDate: {
          //   start: moment().subtract(30, 'days').toDate(),
          //   end: moment().toDate()
          // }
        })
        .subscribe((bondStats) => {
          if (bondStats.length > 0) {
            bondStats = bondStats[0];

            this.stats.activeCases = bondStats.activeCases;
            this.stats.caseRequests = bondStats.pendingRequest;
            this.stats.casesClosedThisMonth = bondStats.casesClosed;
            
          }
        });
    }
  }

  getBondStatsWithoutDate() {
    if (this.userStore.getUser()) {
      this.bondsService
        .getBondsStats({
          filingAgentId: !this.userStore.getUser().roles.agencyOwner && !this.userStore.getUser().roles.agencyManager ? this.userStore.getUser().id : undefined,
          agencyId: this.userStore.getUser().agencyId,
        })
        .subscribe((bondStats) => {
          if (bondStats.length > 0) {
            bondStats = bondStats[0];

            this.stats.forfeitureLiability = bondStats.totalForfeitureLiability;
            this.stats.totalLiability = bondStats.totalLiability;
            this.stats.openForfeitureLiability = bondStats.openForfeitureLiability;
            this.stats.openLiability = bondStats.openLiability;
            this.stats.totalBonds = bondStats.totalBonds;
            this.stats.activeBonds = bondStats.activeBonds;
          }
        });
    }
  }

  
  getTasksData(){
    this.tasksService.getTasks({
      assignedToUserId: this.userStore.getUser().id,
      status: 'pending'
    })
    .subscribe(
      tasks => {
        this.tasks = tasks.data;
      }
    )
  }

  async openModal() {
    const modal = await this.modalController.create({
      component: DefendantQuickFormComponent,
    });

    await modal.present();

    modal.onDidDismiss().then((data) => {
      this.getAgencyStats();
    });
  }

  public barChartOptions: any = {
    scaleShowVerticalLines: false,
    responsive: true,
  };

  // events
  public chartClicked(e: any): void {
  }

  public chartHovered(e: any): void {
  }

  public randomize(): void {
    // Only Change 3 values
    let data = [
      Math.round(Math.random() * 100),
      59,
      80,
      Math.random() * 100,
      56,
      Math.random() * 100,
      40,
    ];
    let clone = JSON.parse(JSON.stringify(this.barChartData));
    clone[0].data = data;
    this.barChartData = clone;
  }

  goToTasksPage() {
    this.router.navigate(["/tasks"]);
  }

  goToLogsPage() {
    this.router.navigate(["/logs"]);
  }

  async uploadImage() {
    const modal = await this.modalController.create({
      component: DocumentUploaderComponent,
    });

    await modal.present();
  }

  async getAgentPowers(append = false){
    
    const loading = await this.loadingController.create({
      message: 'Please wait...',
    });
    
    await loading.present();

    let params: any = {
      agencyId: this.userStore.getUser().agencyId,
      executedAt: {
        $exists: false
      },
      voidedAt: {
        $exists: false
      },
      project: {
        voidedAt: 1,
        executedAt: 1,
        agentAcceptedAt: 1,
        "prefix.amount": 1,
        assignedStaffMember: 1
      }
    }

    if (!this.userStore.getUser().roles.agencyOwner && !this.userStore.getUser().roles.agencyManager) {
      params.assignedAgentId = this.userStore.getUser().id;
      params.agentAcceptedAt = {
        $exists: true
      }
    }
    else{
      params.assignedAgentId = {
        $exists: false
      }
    }

    this.powerService
    .getPowers(params)
    .subscribe(
      powers => {

        this.powersTotal = 0;
        this.powers = powers.data;

        this.powers.forEach(power => {
          this.powersTotal += power.prefix ? power.prefix.amount : 0;
        })

        loading.dismiss();
      },
      error => {
        loading.dismiss();
      }
    )
  }
  
  getNextCourtDate(){
    this.courtDatesService
    .getCourtDates({
      agencyId: this.userStore.getUser().agencyId,
      latestCourtDates: true,
      courtDate: {
        start: moment().format('MM/DD/YYYY'),
        end: moment().add(30, 'days').format('MM/DD/YYYY')
      },
      sortBy: 'lastCourtDate.date',
      orderBy: 'ASC',
      pageNumber: 1,
      pageSize: 2,
      agentId: this.userStore.getUser().id,
      project: {
        lastCourtDate: 1,
        "bonds.courtDates": 1,
        name: 1,
        "bonds.court": 1,
        "bonds.power": 1,
        "bonds._id": 1
      }
    })
    .subscribe(
      courtDates => {
        if(courtDates.data.length > 0){
          this.nextCourtDate = courtDates.data[0];
        }
      },
      errors => {
      }
    )
  }

  getUpcomingCourtDates(){

    this.courtDatesService
    .getCourtDates({
      agencyId: this.userStore.getUser().agencyId,
      latestCourtDates: true,
      courtDate: {
        start: moment().format('MM/DD/YYYY'),
        end: moment().add(7, 'days').format('MM/DD/YYYY')
      },
      sortBy: 'lastCourtDate.date',
      orderBy: 'ASC',
      pageNumber: 1,
      pageSize: 10,
      project: {
        lastCourtDate: 1,
        "bonds.courtDates": 1,
        name: 1,
        "bonds.court": 1,
        "bonds.power": 1,
        "bonds._id": 1
      }
    })
    .subscribe(
      courtDates => {
        this.upcomingCourtDates = courtDates.data;
      },
      errors => {
      }
    )
  }

  segmentChanged(segment){
    this.segment = segment.detail.value;
    if (this.segment === 'forfeiture') {
      this.getForfeitedBonds();
    }
    else{
      // this.getAgentPowers();
    }
  }


  async getForfeitedBonds(params = null){
    this.bondsService
    .getBonds({
      ...params,
      agencyId: this.userStore.getUser().agencyId,
      forfeiture: {
        $exists: true
      },
      forfeitureStatus: 'opened',
      exoneration: {
        $exists: false
      },
      pageNumber: 1,
      pageSize: 10,
      sortBy: 'bonds.forfeiture.satisfyDate',
      orderBy: 'ASC',
      platform: {
        $ne: 'captira-legacy'
      }
    })
    .subscribe(
      bonds => {
        this.forfeitureBonds = this.forfeitureBonds.concat(bonds.data);
      },
      errors => {
      }
    )
  }
  
  getRemainingDays(bond){
    const satisfyDate = moment(bond.forfeiture.satisfyDate).utc().format('MM/DD/YYYY');
    const currDate =  moment().utc().format('MM/DD/YYYY')

    var RD = moment(satisfyDate).diff(currDate, 'days');
    return RD;
  }

  
  logout(){
    this.authService.logout();
    this.appService.setUserLoggedIn(false);
    this.router.navigate(['login']);
  }
}
