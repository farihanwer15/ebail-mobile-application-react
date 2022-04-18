import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ArrestAlertsComponent } from './arrest-alerts.component';

describe('ArrestAlertsComponent', () => {
  let component: ArrestAlertsComponent;
  let fixture: ComponentFixture<ArrestAlertsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ArrestAlertsComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ArrestAlertsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
