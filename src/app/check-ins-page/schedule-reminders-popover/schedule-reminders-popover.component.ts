import { CommonModule } from '@angular/common';
import { Component, NgModule, OnInit, Input } from '@angular/core';
import { IonicModule, ModalController, LoadingController } from '@ionic/angular';
import { HelpersService } from '../../services/helpers.service';


@Component({
  selector: 'app-schedule-reminders-popover',
  templateUrl: './schedule-reminders-popover.component.html',
  styleUrls: ['./schedule-reminders-popover.component.scss'],
})
export class ScheduleRemindersPopoverComponent implements OnInit {
  timezone = '-0700';
  @Input() data
  @Input() type

  constructor(
    public helpersService: HelpersService,
    private modalController: ModalController,
    private loadingController: LoadingController,
  ) { }

  ngOnInit() {}

  async closeModal() {
    await this.modalController.dismiss();
  }

}


@NgModule({
  imports: [
    CommonModule,
    IonicModule,
  ],
  declarations: [ScheduleRemindersPopoverComponent]
})
class ScheduleRemindersPopoverModule {
}