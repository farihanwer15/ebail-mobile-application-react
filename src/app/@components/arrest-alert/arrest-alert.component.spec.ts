import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ArrestAlertComponent } from './arrest-alert.component';

describe('ArrestAlertComponent', () => {
  let component: ArrestAlertComponent;
  let fixture: ComponentFixture<ArrestAlertComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ArrestAlertComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ArrestAlertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
