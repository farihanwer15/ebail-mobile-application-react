import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DefendantFilterFormComponent } from './defendant-filter-form.component';

describe('DefendantFilterFormComponent', () => {
  let component: DefendantFilterFormComponent;
  let fixture: ComponentFixture<DefendantFilterFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DefendantFilterFormComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(DefendantFilterFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
