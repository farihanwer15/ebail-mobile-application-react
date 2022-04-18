import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PowerFilterFormComponent } from './power-filter-form.component';

describe('PowerFilterFormComponent', () => {
  let component: PowerFilterFormComponent;
  let fixture: ComponentFixture<PowerFilterFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PowerFilterFormComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PowerFilterFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
