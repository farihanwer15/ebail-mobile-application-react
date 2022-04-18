import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { InvoiceItemFormComponent } from './invoice-item-form.component';

describe('InvoiceItemFormComponent', () => {
  let component: InvoiceItemFormComponent;
  let fixture: ComponentFixture<InvoiceItemFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InvoiceItemFormComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(InvoiceItemFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
