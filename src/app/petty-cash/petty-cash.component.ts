import { Component, OnInit } from '@angular/core';
import {PettyCashSpentFormComponent} from '../@components/bond/petty-cash-spent-form/petty-cash-spent-form.component'
import { LoadingController, ModalController,ActionSheetController } from '@ionic/angular';
import { UserStore } from 'src/app/@store/user.store';
import { PettyCashService } from '../services/petty-cash.service';
import { ReceiptsService } from '../services/receipts.service';

@Component({
  selector: 'app-petty-cash',
  templateUrl: './petty-cash.component.html',
  styleUrls: ['./petty-cash.component.scss'],
})
export class PettyCashComponent implements OnInit {
memberId;


pettyCash = [];

stats = {
  totalSpent: 0,
  totalIssued: 0,
  owed: 0
}
filter = {
  orderBy: 'ASC',
  sortBy: 'createdAt'

}
  constructor(
    private modalController: ModalController,
    private userStore: UserStore,
    private pettyCashService: PettyCashService,
    private receiptService: ReceiptsService,
    private loadingController: LoadingController,
    private actionSheetController: ActionSheetController,



  ) { }

  ngOnInit() {
    this.memberId = this.userStore.getUser().id
    this.getPettyCash()
    this.getStats()
  }
 async getPettyCash(){
    const loading = await this.loadingController.create();
    await loading.present();
    this.pettyCashService
    .getAllPettyCash({
      ...this.filter,
      agencyId: this.userStore.getUser().agencyId,
      issuedToUserId: this.memberId
    })
    .subscribe(
    async  cash => {
        this.pettyCash = cash;
        await loading.dismiss();
      },
     async errors => {
        await loading.dismiss();
      }
    )
  }
  async presentActionSheet(cash) {
    const actionSheet = await this.actionSheetController.create({
      header: 'Options',
      buttons: [
        {
          text: 'Edit',
          handler: () => {
            this.openEditFormModal(cash._id)
          },
        },
      {
        text: 'Delete',
        role: 'destructive',
        handler: () => {
          this.deleteItem(cash._id)
        }
      }]
    });
    await actionSheet.present();
  }
 async deleteItem(id){
    const loading = await this.loadingController.create();
    await loading.present();
          this.pettyCashService.deletePettyCash(id)
          .subscribe(
            async(data) => {
              this.getPettyCash()
              await loading.dismiss();
            },
           async errors => {
              await loading.dismiss();

            
           
        }
      
    );
  }
  async openEditFormModal(id){
    const modal = await this.modalController.create({
      component: PettyCashSpentFormComponent,
      componentProps: {
        pettyCashId: id      }
    });
    modal.onDidDismiss()
    .then((data) => {
      this.getPettyCash()
      this.getStats()

    
  });
    (await modal).present();
  }
  async openFormModal(){
    const modal = await this.modalController.create({
      component: PettyCashSpentFormComponent,
      componentProps: {
        staffMemberId:this.memberId
      }
    });
    modal.onDidDismiss()
    .then((data) => {
      this.getPettyCash()
      this.getStats()
  });
    (await modal).present();
  }


  getStats(){
    this.pettyCashService
    .getStats({
      agencyId: this.userStore.getUser().agencyId,
      userId: this.memberId
    })
    .subscribe(
      stats => {
        if (stats.length > 0) {
          this.stats = stats[0];
        }
      }
    )
  }
}
