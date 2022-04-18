import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AddBondIndemnitorFormComponent } from './add-bond-indemnitor-form.component';

describe('AddBondIndemnitorFormComponent', () => {
  let component: AddBondIndemnitorFormComponent;
  let fixture: ComponentFixture<AddBondIndemnitorFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddBondIndemnitorFormComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AddBondIndemnitorFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
