import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DefendantIndemnitorsListComponent } from './defendant-indemnitors-list.component';

describe('DefendantIndemnitorsListComponent', () => {
  let component: DefendantIndemnitorsListComponent;
  let fixture: ComponentFixture<DefendantIndemnitorsListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DefendantIndemnitorsListComponent],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(DefendantIndemnitorsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
