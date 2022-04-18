import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PettyCashSpentFormComponent } from './petty-cash-spent-form.component';

describe('PettyCashSpentFormComponent', () => {
  let component: PettyCashSpentFormComponent;
  let fixture: ComponentFixture<PettyCashSpentFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PettyCashSpentFormComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PettyCashSpentFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
