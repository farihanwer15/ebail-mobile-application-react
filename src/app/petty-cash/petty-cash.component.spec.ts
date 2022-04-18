import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PettyCashComponent } from './petty-cash.component';

describe('PettyCashComponent', () => {
  let component: PettyCashComponent;
  let fixture: ComponentFixture<PettyCashComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PettyCashComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PettyCashComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
