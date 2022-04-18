import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { BondsPage } from './bonds.page';

describe('BondsPage', () => {
  let component: BondsPage;
  let fixture: ComponentFixture<BondsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BondsPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(BondsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
