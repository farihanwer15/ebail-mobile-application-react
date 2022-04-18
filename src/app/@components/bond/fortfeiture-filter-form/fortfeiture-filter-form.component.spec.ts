import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { FortfeitureFilterFormComponent } from './fortfeiture-filter-form.component';

describe('FortfeitureFilterFormComponent', () => {
  let component: FortfeitureFilterFormComponent;
  let fixture: ComponentFixture<FortfeitureFilterFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FortfeitureFilterFormComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(FortfeitureFilterFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
