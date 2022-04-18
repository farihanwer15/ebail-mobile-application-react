import { Component, OnInit,RendererFactory2, Inject,Renderer2 } from "@angular/core";
import { Router, ActivatedRoute } from '@angular/router';
import { BondsService } from 'src/app/services/bonds.service';
import { ModalController } from '@ionic/angular';
import { BondDetailsComponent } from 'src/app/@components/bond/bond-details/bond-details.component';
import { DefendantsService } from 'src/app/services/defendants.service';
import { UserStore } from "../../@store/user.store";
import { DOCUMENT } from '@angular/common';
import { AppService } from '../../services/app.service';

import * as _ from 'lodash';

@Component({
  selector: 'app-defendant-bonds',
  templateUrl: './defendant-bonds.page.html',
  styleUrls: ['./defendant-bonds.page.scss'],
})
export class DefendantBondsPage implements OnInit {
  
  bonds = [];
  inCustody = undefined;

  defendantId;
  defendant;

  darkMode = true
  renderer: Renderer2;
  constructor(
    private router: Router,
    private bondsService: BondsService,
    private route: ActivatedRoute,
    private modalController: ModalController,
    private defService: DefendantsService,
    public userStore: UserStore,
    private appService: AppService,
    private rendererFactory : RendererFactory2,
    @Inject(DOCUMENT)
    private document:Document
  ) {
    this.defendantId = this.route.snapshot.paramMap.get('defendantId');
    this.renderer = this.rendererFactory.createRenderer(null, null)
  }
  
  ngOnInit() {
    this.getDefendantData();
    this.appService.getDarkMode().subscribe(res => {
      console.log('app theme 4', res)
      if (res) {
        
        this.renderer.addClass(this.document.body, 'dark-theme')
        this.darkMode = true;

      } else {
        this.renderer.removeClass(this.document.body, 'dark-theme')
        this.darkMode = false;

      }
    })
  }

  getDefendantData(){
    this.defService
    .getDefendant(this.defendantId)
    .subscribe(
      def => {
        this.defendant = def;
        this.inCustody = def.custody && def.custody.status === 'enabled' ? true : false;
        if (def.bonds) {
          // this.bonds = def.bonds;
          this.bonds = _.orderBy(def.bonds, ['bondDate'], ['desc'] );
          this.bonds.forEach(bond => {
            if (bond.courtDates && bond.courtDates.length > 0) {
              bond.nextCourtDate = bond.courtDates[bond.courtDates.length - 1];
            }
          })
        }
      }
    )
  }

  async openBondDetailsModal(bondId) {
    
    const modal = await this.modalController.create({
      component: BondDetailsComponent,
      componentProps: {
        defendant: this.defendant,
        bondId: bondId
      }
    });

    await modal.present();

  }

  editBond(bondId) {
    this.router.navigate([
      'bond-form', 
      this.defendantId,
      bondId
    ]);
  }

  addBond() {
    this.router.navigate([
      'bond-form', 
      this.defendantId
    ]);
  }

}
