import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CheckInsPageComponent } from './check-ins-page.component';

describe('CheckInsPageComponent', () => {
  let component: CheckInsPageComponent;
  let fixture: ComponentFixture<CheckInsPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CheckInsPageComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(CheckInsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
