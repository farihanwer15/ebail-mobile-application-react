import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CourtFilterFormComponent } from './court-filter-form.component';

describe('CourtFilterFormComponent', () => {
  let component: CourtFilterFormComponent;
  let fixture: ComponentFixture<CourtFilterFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CourtFilterFormComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(CourtFilterFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
