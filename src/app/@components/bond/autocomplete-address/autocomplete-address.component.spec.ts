import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AutocompleteAddressComponent } from './autocomplete-address.component';

describe('AutocompleteAddressComponent', () => {
  let component: AutocompleteAddressComponent;
  let fixture: ComponentFixture<AutocompleteAddressComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AutocompleteAddressComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AutocompleteAddressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
