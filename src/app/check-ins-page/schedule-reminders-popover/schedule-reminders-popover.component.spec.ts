import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ScheduleRemindersPopoverComponent } from './schedule-reminders-popover.component';

describe('ScheduleRemindersPopoverComponent', () => {
  let component: ScheduleRemindersPopoverComponent;
  let fixture: ComponentFixture<ScheduleRemindersPopoverComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScheduleRemindersPopoverComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ScheduleRemindersPopoverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
