import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MerchantAccountSignupNoticeComponent } from './merchant-account-signup-notice.component';

describe('MerchantAccountSignupNoticeComponent', () => {
  let component: MerchantAccountSignupNoticeComponent;
  let fixture: ComponentFixture<MerchantAccountSignupNoticeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MerchantAccountSignupNoticeComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MerchantAccountSignupNoticeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
