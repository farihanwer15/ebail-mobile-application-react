import { Component, OnInit } from '@angular/core';
import { TasksService } from '../services/tasks.service';
import { ToastController, LoadingController, ActionSheetController } from '@ionic/angular';
import { UserStore } from '../@store/user.store';
import * as _ from 'lodash';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.page.html',
  styleUrls: ['./tasks.page.scss'],
})
export class TasksPage implements OnInit {

  tasks = {
    data: []
  }
  pageNumber = 1
  constructor(
    private taskService: TasksService,
    private toastrService: ToastController,
    private loadingController: LoadingController,
    private userStore:UserStore,
    private actionSheetController: ActionSheetController,
    private toastController: ToastController
  ) { }

  ngOnInit() {
    this.getTasks();
  }

  async getTasks(apend?){
    const loading = await this.loadingController.create({
      message: 'Please wait...',
    });
    await loading.present();

    this.taskService
    .getTasks({
      agencyId: this.userStore.getUser().agencyId,
      assignedToUserId: this.userStore.getUser().id,

      archivedAt: {
        $exists: false
      },
      sortBy: 'createdAt',
      orderBy: 'DESC',
      pageNumber : this.pageNumber,
      pageSize: 10,
    })
    .subscribe(
      async tasks => {
        if (apend) {
          this.tasks.data = _.concat(this.tasks.data,tasks.data);  
        } else {
          this.tasks = tasks;
        }
        await loading.dismiss();
      },
      async errors => {
        await loading.dismiss();
      }
    );
  }

  
  loadData(event) {
    
    this.pageNumber++;
    this.getTasks(true)
    //this.getDefendants(true);
    setTimeout(() => {
      event.target.complete();
    }, 500);
  }

  async openActionSheet(task){

    if (task.completedAt) {
      return;
    }

    const actionSheet = await this.actionSheetController.create({
      header: 'Task',
      cssClass: 'my-custom-class',
      buttons: [{
        text: 'Mark as Complete',
        icon: 'checkmark-done-outline',
        handler: () => {
          this.markAsComplete(task._id);
        }
      },
      {
        text: 'Cancel',
        icon: 'close',
        role: 'cancel',
      }]
    });
    await actionSheet.present();
  }

  async markAsComplete(taskId){
    
    const loading = await this.loadingController.create({
      message: 'Please wait...'
    });
    await loading.present();

    this.taskService.updateTask(taskId, {
      status: 'completed',
      completedAt: new Date()
    })
    .subscribe(
      async () => {
        this.getTasks();

        const toast = await this.toastController.create({
          color: 'success',
          duration: 3000,
          message: 'Task marked as completed successfully.',
          showCloseButton: true,
          position: 'top'
        });
        await toast.present();
        await loading.dismiss();

      },
      async errors => {
        console.log(errors);
        await loading.dismiss();
      }
    );  
  }

}
