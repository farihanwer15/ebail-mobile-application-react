import { Component, OnInit, Input, ViewChild, Output, EventEmitter, SimpleChanges, OnChanges, AfterViewInit } from '@angular/core';
import { UserStore } from 'src/app/@store/user.store';
import { StaffService } from 'src/app/services/staff.service';
import { BondsService } from 'src/app/services/bonds.service';
import { ChargesService } from 'src/app/services/charges.service';
import { FacilitiesService } from 'src/app/services/facilities.service';
import { SuretyService } from 'src/app/services/surety.service';
import { PrefixService } from 'src/app/services/prefix.service';
import { PowersService } from 'src/app/services/powers.service';
import { NgForm } from '@angular/forms';
import { ToastController,ModalController, LoadingController } from '@ionic/angular';
import { AgencyService } from 'src/app/services/agency.service';
import { CourtsService } from 'src/app/services/courts.service';
import { AddCourtFormComponent } from '../../../@components/bond/add-court-form/add-court-form.component';
import * as _ from 'lodash';
import * as moment from 'moment';
import { IonicSelectableComponent } from 'ionic-selectable';

@Component({
  selector: 'app-bond-info-form',
  templateUrl: './bond-info-form.component.html',
  styleUrls: ['./bond-info-form.component.scss'],
})
export class BondInfoFormComponent implements OnInit, OnChanges {

  @ViewChild('bondInfoForm', {static: false}) bondInfoForm: NgForm;
  @Input() defendantId;
  @Input() bondId;

  @Input() basicInfo = true;
  @Input() receipts = true;
  @Input() courtDates = true;
  @Input() indemnitors = true;
  @Input() collaterals = true;

  @Input() bond: any;
  @Output() bondAdded = new EventEmitter();

  @Output() bondInfoSaved = new EventEmitter;
  cashSureties = []
  errors = [];

  filingAgentId;
  facilityId;
  referralAgentId
  courtId;
  postingUserId;
  isCalculatePremium = false
  premiumPercentageValue = undefined
  powerObj = {
    suretyId: undefined,
    prefixId: undefined,
    powerId: undefined,
    reserved: false
  }
  postingDate = undefined;
  postingTime = undefined;
  agents = {
    data: [],
    meta: {}
  };
  facilities = {
    data: [],
    meta: {}
  };
  charges = {
    data: [],
    meta: {}
  };
  sureties = {
    data: [],
    meta: {}
  };

  courts = {
    data: [],
    meta: {}
  };
  
  powers: {
    data: []
  }
  
  states = [];
  counties = [];
  
  prefixes = []
  powerNumbers = [];
  bondPowers=[]

  constructor(
    public userStore: UserStore,
    private staffService: StaffService,
    private bondsService: BondsService,
    private facilitiesService: FacilitiesService,
    private chargesService: ChargesService,
    private suretiesService: SuretyService,
    private prefixService: PrefixService,
    private powersService: PowersService,
    private toastController: ToastController,
    private loadingController: LoadingController,
    private courtsService: CourtsService,
    private modalController: ModalController,
    private agencyService: AgencyService,
  ){

  }

  ngOnInit() {

    if (this.userStore.getAgency().autoBondNumber && !this.bond.number) {
      this.generateBondNumber();
    }

    this.getCharges();
    this.getStates();
    this.getPrememiumPercentage()
    if(this.bond) {
      this.initBond();
     
      this.getFacilities();
      this.getAgents();
      this.getCourts();
    }
  }

  // ngAfterViewInit(){
  //   this.getStates();
  // }

  portChange(event: {
    
    component: IonicSelectableComponent,
    value: any
  }) {
    console.log('port:', event.value);
    this.bond.charges = []
    for (let index = 0; index < event.value.length; index++) {
      const element = event.value[index].name;
      this.bond.charges.push(element)
      
    }
    console.log('bonss:', this.bond);
  }
  
  initBond(){
    console.log('BOND2', this.bond)
    if (this.bond.filingAgent) {
      this.filingAgentId = this.bond.filingAgent._id;
    } else {
      this.filingAgentId = undefined;
    }
   

    if (this.bond.referralAgent) {
      this.referralAgentId = this.bond.referralAgent._id;
    }
    if (this.bond.charges) {
      this.bond.charges = this.bond.charges
    }

    if (this.bond.facility) {
      this.facilityId = this.bond.facility._id;
    } else {
      this.facilityId = undefined;
    }

    if (this.bond.court) {
      this.courtId = this.bond.court._id;
    } else {
      this.courtId = undefined;
    }

    if (this.bond.bondDate) {
      const timezone = this.userStore.getAgency().timezone
        ? this.userStore.getAgency().timezone
        : "+0000";
      //this.bond.date = moment(this.bond.bondDate);
      this.postingDate = this.bond.postingTimeExists
        ? moment(this.bond.bondDate).utcOffset(timezone)
        : moment(this.bond.bondDate).utc(false);
      this.postingTime = this.bond.postingTimeExists
        ? moment(this.bond.bondDate).utcOffset(timezone)
        : undefined;
    }
    if (this.bond.bondNumber) {
      this.bond.number = this.bond.bondNumber;
    }

    if (this.bond.power) {
      this.powerObj.reserved = true;
      this.powerObj.powerId = this.bond.power._id;
      this.powerObj.prefixId = this.bond.power.prefix
        ? this.bond.power.prefix._id
        : undefined;
      this.powerObj.suretyId = this.bond.power.surety
        ? this.bond.power.surety._id
        : undefined;
      this.powerNumbers = [
        {
          _id: this.bond.power._id,
          number: this.bond.power.number,
        },
      ];

      // this.getPowers(
      //   this.bond.power.surety ? this.bond.power.surety._id : null,
      //   this.bond.power.prefix ? this.bond.power.prefix._id : null,
      //   // bond.power ? bond.power._id : null
      // );
    } else {
      let suretyId = undefined;

      if (this.bond.tempSurety) {
        suretyId = this.bond.tempSurety._id;
      }

      this.powerObj = {
        suretyId: suretyId,
        prefixId: undefined,
        powerId: undefined,
        reserved: false,
      };
      // this.onSuretyChange()
    }

    if (this.bond.powers) {
      this.bondPowers = [];
      this.bond.powers.forEach(power => {
        this.bondPowers.push({
          prefixId: power.prefix ? power.prefix._id : undefined,
          powerId: power._id,
          charges: power.charges,
          number: power.number,
          reserved: power.powerPending ? false : true,
          powerPending: power.powerPending
        })
      });
    }

   
    this.getAgents()
    this.getSureties();
    // this.getAgents();
    // this.getCourts();
  }

  initPower(){
    if (this.bond.power) {
      this.powerObj.reserved = true;
      this.powerObj.powerId = this.bond.power._id;
      this.powerObj.prefixId = this.bond.power.prefix
        ? this.bond.power.prefix._id
        : undefined;
      this.powerObj.suretyId = this.bond.power.surety
        ? this.bond.power.surety._id
        : undefined;
      this.powerNumbers = [
        {
          _id: this.bond.power._id,
          number: this.bond.power.number,
        },
      ];
    } else {
      let suretyId = undefined;

      if (this.bond.tempSurety) {
        suretyId = this.bond.tempSurety._id;
      }

      this.powerObj = {
        suretyId: suretyId,
        prefixId: undefined,
        powerId: undefined,
        reserved: false,
      };
    }

  
  }

  async openCourtFormModal(){
    this.bond.county=undefined 
    const modal = this.modalController.create({
      component: AddCourtFormComponent,
      componentProps: {
        bondId: this.bondId
      }
    });

    (await modal).present();
    
  }
  getStates(){
    this.states = this.userStore.getStates();
    if (this.userStore.getAgency().state) {
      this.bond.state = this.userStore.getAgency().state;
      this.getCounties();
    }
  }

  getCounties(){
    this.counties = this.userStore.getCountiesByState(this.bond.state);
  }

  getAgents(agentId = null){

    return this.staffService.getStaffMembers({
      agencyId: this.userStore.getUser().agencyId,
      sortBy: 'name.first',
      orderBy: 'ASC',
      blocked: false,
      project: {
        _id: 1,
        name: 1,
        email: 1,
        roles: 1,
        agencyId: 1,
        officeId: 1,
        agentLIC: 1
      }
    })
    .subscribe(
      agents => {
        this.agents = agents;
        this.filingAgentId = this.userStore.getUser().id;
        
        this.filingAgentId = undefined;
        if (this.bond && this.bond.filingAgent) {
          this.filingAgentId = this.bond.filingAgent._id;
        }
        this.initPower();
      }
    )
  }

  getCourts(selectedCourtId = null) {
    this.courtsService.getCourts({
      county: this.bond.county
    })
      .subscribe(
        courts => {
          this.courts.data = _.orderBy(courts.data, ['name'], ['asc']);

          this.courtId = undefined;
          if (this.bond && this.bond.court) {
            this.courtId = this.bond.court._id;
          }
        }
      )
  }

  getFacilities(facilityId = null){
    this.facilitiesService.getFacilites()
    .subscribe(
      facilities => {
        
        this.facilities.data = _.orderBy(facilities.data, ['name'], ['asc']);
        if(facilityId){
          this.facilityId = facilityId;
        }
      }
    )
  }

  getCharges(){
    this.chargesService.getCharges()
    .subscribe(
      charges => this.charges = charges
    )
  }

  
  getSureties(suretyId = null) {
    this.suretiesService.getSureties({
      agencyId: this.userStore.getUser().agencyId,
      archived: false,
    })
      .subscribe(
        sureties => {
          console.log('Sureties', this.powerObj.suretyId, sureties);
          
          this.sureties = sureties;

          this.cashSureties = _.filter(this.sureties.data, (s) => {
            return s.name === 'Cash' || s.type === 'Cash';
          });

          this.bond.cashLicenseId = undefined
          setTimeout(() => {
            
            if(this.bond.cashSurety){
              this.bond.cashLicenseId = this.bond.cashSurety._id
            }

            if (!this.bond.cashLicenseId && this.cashSureties.length > 0) {
              this.bond.cashLicenseId = this.cashSureties[0]._id;
            }
          }, 200)

          _.remove(this.sureties.data, s => {
            return s.name === 'Cash' || s.type == 'Cash';
          })

          // if (!this.powerObj.suretyId) {
           
          //   this.powerObj.suretyId = sureties.data.length ? sureties.data[0]._id : this.powerObj.suretyId;
            
          //   const primarySurety = _.find(sureties.data, (s) => {
          //     return s.primary;
          //   });
          //   this.powerObj.suretyId = primarySurety ? primarySurety._id : this.powerObj.suretyId;
          // }
          
          if (suretyId) {
            this.powerObj.suretyId = suretyId;
          }
          if (this.filingAgentId && this.bond.bondAmount) {
            this.getPrefixes(this.powerObj.prefixId)
          }
      });
  }
 
  getPrememiumPercentage(){
    this.agencyService
    .getAgency(this.userStore.getUser().agencyId)
    .subscribe(
      agency => {
        this.premiumPercentageValue = agency.bondPremiumPercentage
      })
  }

  calculateValue(event: any){
    if (this.premiumPercentageValue) {
      let amount = event.target.value
      amount = amount.toString().replace(/,/g,'')
      let calculate = amount * (this.premiumPercentageValue/100)
      this.bond.premiumAmount = calculate
    }
  }
 async getPrefixes(prefixId = null) {
    this.errors = [];
    if (!this.filingAgentId) {
      this.errors.push("Please select a filing agent.");
      const toast = await this.toastController.create({
        color: 'danger',
        duration: 3000,
        message: 'Please select a filing agent',
        showCloseButton: true,
        position: 'top'
      });
    await toast.present();
    return false
    }

    if (!this.bond.bondAmount) {
      // this.powerObj.suretyId = undefined;
      this.errors.push("Please enter a bond amount.");
      const toast = await this.toastController.create({
        color: 'danger',
        duration: 3000,
        message: 'Please enter a bond amount.',
        showCloseButton: true,
        position: 'top'
      });
    await toast.present();
    return false
    }

    let minPrefixAmount = this.bond.bondAmount;
    if (typeof minPrefixAmount === "string") {
      minPrefixAmount = parseFloat(this.bond.bondAmount.replace(/,/g, ""));
    }

    this.prefixService
      .getPrefixes({
        minPrefixAmount: minPrefixAmount,
        suretyId: this.powerObj.suretyId,
      })
      .subscribe((prefixes) => {
        this.prefixes = prefixes.data;
        if (prefixId) {
          this.powerObj.prefixId = prefixId;
        }
      });
  }

  
 

  getPowerNumbers() {

    let powerNumbers = _.filter(this.powers.data, power => {
      return power.prefix._id === this.powerObj.prefixId;
    });

    powerNumbers = _.sortBy(powerNumbers, power => {
      return power.number;
    })

    this.powerNumbers = powerNumbers;
  }
  onAgentSelected() {
    // this.powerObj.suretyId = undefined;
    this.powerObj.prefixId = undefined;
    this.powerObj.powerId = undefined;
    this.prefixes = [];
    this.powerNumbers = [];
    if (this.powerObj.suretyId && this.bond.bondAmount) {
      // this.getPowers();
      this.getPrefixes();
    }
  }


  onSuretyChange() {
    this.powerObj.prefixId = undefined;
    this.powerObj.powerId = undefined;
    this.prefixes = [];
    this.powerNumbers = [];
    if (this.powerObj.suretyId) {
      
      this.getPrefixes();
    }
  }
  onBondAmountBlur(){
    // this.getPowers();
    this.powerObj.prefixId = undefined;
    this.powerObj.powerId = undefined;
    this.prefixes = [];
    this.powerNumbers = [];
    this.getPrefixes();
  }

  onPrefixChange(){
    this.powerObj.powerId = undefined;
    this.getPowers();
  }
 async getPowers(suretyId = null, prefixId = null, powerId = null) {
    if (suretyId) {
      this.powerObj.suretyId = suretyId;
    }

    if (prefixId) {
      this.powerObj.prefixId = prefixId;
    }

    if (!this.powerObj.prefixId) {
      return;
    }

    const prefix = _.find(this.prefixes, (prefix) => {
      return prefix._id === this.powerObj.prefixId;
    });

    if (prefix) {
      let minPrefixAmount = this.bond.bondAmount;
      if (typeof minPrefixAmount === "string") {
        minPrefixAmount = parseFloat(this.bond.bondAmount.replace(/,/g, ""));
      }

      if (minPrefixAmount > prefix.amount) {
        const toast = await this.toastController.create({
          color: 'danger',
          duration: 3000,
          message: 'This selected prefix does not satisfies the bond amount.',
          showCloseButton: true,
          position: 'top'
        });
      await toast.present();
      return false
      }
    }

    let powerParams = {
      suretyId: this.powerObj.suretyId,
      assignedAgentId: this.filingAgentId,
      prefixId: this.powerObj.prefixId,
      agentAcceptedAt: {
        $exists: true,
      },
      executedAt: {
        $exists: false,
      },
      voidedAt: {
        $exists: false,
      },
      project: {
        agentAcceptedAt: 1,
        executedAt: 1,
        voidedAt: 1,
        assignedAgentId: 1,
        "assignedStaffMember._id": 1,
        "assignedStaffMember.name": 1,
        prefix: 1,
        surety: 1,
        number: 1,
        expiryDate: 1,
      }
    }

    if (this.userStore.getAgency().removeAssignPowerRequirement) {
      delete powerParams.assignedAgentId,
      delete powerParams.agentAcceptedAt
    }

    this.powersService
      .getPowers(powerParams)
      .subscribe((powers) => {
        this.powers = powers;

        // let powerNumbers = _.filter(this.powers.data, power => {
        //   return power.prefix._id === this.powerObj.prefixId;
        // });

        let powerNumbers = _.sortBy(this.powers.data, (power) => {
          return parseInt(power.number);
        });

        this.powerNumbers = powerNumbers;

        // if (powers.data.length < 1) {
        //   this.warnings.push('This agent does not have a power available that satisfies the bond amount.');
        // }

        // this.prefixes = [];
        if (powers.data.length > 0 && false) {
          let prefixes = _.groupBy(powers.data, (power) => {
            return power.prefix._id;
          });
          prefixes = Object.entries(prefixes);

          for (let i = 0; i < prefixes.length; i++) {
            const prefix = prefixes[i];
            this.prefixes.push(prefix[1][0].prefix);
          }
        }

        if (powerId) {
          this.powerObj.powerId = powerId;
        }
      });
  }
  
  async validate(){
    this.errors = [];

    if (this.bondInfoForm.invalid) {
      Object.keys(this.bondInfoForm.controls).forEach(key => {
        this.bondInfoForm.controls[key].markAsTouched();
      });
      this.errors.push('Please fill all required fields.');
    }
    
    if(this.errors.length > 0){

      const toast = await this.toastController.create({
        color: 'danger',
        duration: 3000,
        message: 'Please fill all required fields.',
        showCloseButton: true,
        position: 'top'
      });

      await toast.present();

      return false;
    }
    return true;
  }
  getCombinedDateObject(date, time) {
    let calculatedDateString;

    if (date) {
      let utcDate = moment(date);
      if (time) {
        let utcTime = moment(time);
        calculatedDateString = moment(`${utcDate.format("YYYY-MM-DD")} ${utcTime.format("HH:mm")}`, 'YYYY-MM-DD HH:mm').format('YYYY-MM-DD HH:mm');
      } else {
        calculatedDateString = moment(`${utcDate.format("YYYY-MM-DD")}`).format('YYYY-MM-DD');
      }
    }
    let finalDateTime = moment(calculatedDateString).toDate();
    if (isNaN(finalDateTime.getTime())) return null;
    else return finalDateTime;
  }

  async onSubmit(){
    if(!await this.validate()){
      return;
    }
    let combinedDate = this.getCombinedDateObject(
      this.postingDate,
      this.postingTime
    );
    const timezone = this.userStore.getAgency().timezone ? this.userStore.getAgency().timezone : "+0000";
    let bondDate = moment(combinedDate, "YYYY-MM-DD HH:mm").utcOffset(timezone, true).toDate();
    
    let bondData: any = {
      postingTimeExists: this.postingTime ? true : false,
      bondDate: bondDate,
      bondAmount: parseFloat(this.bond.bondAmount),
      premiumAmount: parseFloat(this.bond.premiumAmount),
      initialAmount: parseFloat(this.bond.initialAmount),
      filingFee: this.bond.filingFee ? parseFloat(this.bond.filingFee) : undefined,
      stateTaxFee: this.bond.stateTaxFee ? parseFloat(this.bond.stateTaxFee): undefined,
      state: this.bond.state,
      county: this.bond.county,
      type: this.bond.type,
      caseNumber: this.bond.caseNumber,
      docketNumber: this.bond.docketNumber,
      applicationNumber: this.bond.applicationNumber,
      NYCIDNumber: this.bond.nycidNumber,
      indictmentNumber: this.bond.indictmentNumber,
      bookingNumber: this.bond.bookingNumber,
      charges: this.bond.charges,
      bondNumber: this.bond.number,
      cashLicenseId: this.bond.type === 'cash' ? this.bond.cashLicenseId : undefined,
    };

    bondData.officeId = this.userStore.getUser().office._id;
    bondData.agencyId = this.userStore.getUser().agencyId;

    const filingAgent = _.find(this.agents.data, agent => {
      return agent._id === this.filingAgentId;
    });
    bondData.filingAgent = filingAgent ? filingAgent : undefined;

    const facility = _.find(this.facilities.data, fac => {
      return fac._id === this.facilityId;
    });
    bondData.facility = facility ? facility : undefined;

    const court = _.find(this.courts.data, court => {
      return court._id === this.courtId
    });
    bondData.court = court ? court : undefined;

    // ATTACHING POWER ID
    if (this.powerObj.powerId) {
      bondData.powerId = this.powerObj.powerId;
    }
    if (this.bond.powerPending) {
      bondData.powerPending = this.bond.powerPending;
      bondData.suretyId = this.powerObj.suretyId;
    }
    
    if(this.bondId){
      this.updateBond(bondData);
    }
    else{
      this.addBond(bondData);
    }
    
  }

  async addBond(data){

    data.status = 'processing';
    data.postingUser = {
      _id: this.userStore.getUser().id,
      name: this.userStore.getUser().name
    };

    const loading = await this.loadingController.create({
      message: 'Please wait...'
    });
    await loading.present();
    
    this.bondsService.addBond(this.defendantId, data)
    .subscribe(
      async bond => {
        this.bondsService.bondAdded(bond.insertedId);
        
        if (this.powerObj.powerId) {
          this.powerObj.reserved = true;
        }
        this.bondId = bond.insertedId;

        const toast = await this.toastController.create({
          color: 'success',
          duration: 3000,
          message: 'Bond information saved successfully.',
          showCloseButton: true,
          position: 'top'
        });
  
        await toast.present();
        await loading.dismiss();

        this.bondInfoSaved.emit(this.bondId);
      },
      async error => {
        if(error.details){
          error.details.forEach(err => {
            this.errors.push(err.message);
          });
        }
        await loading.dismiss();
      }
    );
  }

  async updateBond(data){
    
    const loading = await this.loadingController.create({
      message: 'Please wait...'
    });
    await loading.present();

    this.bondsService
    .updateBond(this.defendantId, this.bondId, data)
    .subscribe(
      async bond => {
        this.bondsService.bondAdded(bond.insertedId);
        
        if (this.powerObj.powerId) {
          this.powerObj.reserved = true;
        }

        this.bondInfoSaved.emit('updated');
        
        const toast = await this.toastController.create({
          color: 'success',
          duration: 3000,
          message: 'Bond information saved successfully.',
          showCloseButton: true,
          position: 'top'
        });
        await toast.present();
        await loading.dismiss();
  
      },
      async error => {
        if(error.details){
          error.details.forEach(err => {
            this.errors.push(err.message);
          });
          
          await loading.dismiss();
        }
      }
    );
  }

  
  async generateBondNumber() {
    const loading = await this.loadingController.create({
      message: 'Generating bond number...'
    });
    await loading.present();

    this.bondsService
      .generateBondNumber()
      .subscribe(
        async (number) => {
          this.bond.number = number;
          await loading.dismiss();
        },
        async errors => {
          await loading.dismiss();
        }
      )
  }

  async modifyPower() {
    const loading = await this.loadingController.create({
      message: 'Removing Power...'
    });
    await loading.present();
    this.bondsService
      .freePower({
        userId: this.defendantId,
        bondId: this.bondId,
        powerId: this.powerObj.powerId
      })
      .subscribe(
        async power => {
          await loading.dismiss()
          this.powerObj.powerId = undefined;
          this.powerObj.prefixId = undefined;
          this.powerObj.reserved = false;
          this.bondsService.bondUpdated();
        },
        async errors => {
          await loading.dismiss();
        }
      )
  }

  ngOnChanges(changes: SimpleChanges){
    if (changes.bond) {
      this.initBond();
    }
  }
}
