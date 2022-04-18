import { Component, OnInit } from '@angular/core';
import { LogsService } from '../services/logs.service';
import { LoadingController } from '@ionic/angular';
import * as _ from 'lodash';
import { UserStore } from '../@store/user.store';

@Component({
  selector: 'app-logs',
  templateUrl: './logs.page.html',
  styleUrls: ['./logs.page.scss'],
})
export class LogsPage implements OnInit {

  logs = {
    data: []
  };

  filters = {
    pageNumber: 1
  }

  constructor(
    private logsService: LogsService,
    private loadingController: LoadingController,
    private userStore: UserStore
  ) { }

  ngOnInit() {
    this.getLogs();
  }
  
  async getLogs(append = false){
    const loading = await this.loadingController.create({
      message: 'Please wait...'
    });
    await loading.present();

    this.logsService
    .getLogs({
      orderBy: 'DESC',
      sortBy: 'createdAt',
      pageSize: 30,
      pageNumber: this.filters.pageNumber,
      agentId: this.userStore.getUser().id
    })
    .subscribe(
      async logs => {
        await loading.dismiss();

        if (append) {
          this.logs.data = _.concat(this.logs.data, logs.data);
        } else {
          this.logs = logs;
        }
        
      },
      async errors => {
        await loading.dismiss();
      }
    )
  }

  loadData(event) {
    
    this.filters.pageNumber++;
    this.getLogs(true);
    setTimeout(() => {
      event.target.complete();
    }, 500);
  }

}
