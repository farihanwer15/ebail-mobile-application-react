import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ContractListComponent } from './contract-list.component';

describe('ContractListComponent', () => {
  let component: ContractListComponent;
  let fixture: ComponentFixture<ContractListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContractListComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ContractListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
