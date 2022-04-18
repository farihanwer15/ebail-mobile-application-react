import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ContractFormComponent } from './contract-form.component';

describe('ContractFormComponent', () => {
  let component: ContractFormComponent;
  let fixture: ComponentFixture<ContractFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContractFormComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ContractFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
