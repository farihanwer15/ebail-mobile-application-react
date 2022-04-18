import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DefendantUploadDocumentFormComponent } from './defendant-upload-document-form.component';

describe('DefendantUploadDocumentFormComponent', () => {
  let component: DefendantUploadDocumentFormComponent;
  let fixture: ComponentFixture<DefendantUploadDocumentFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DefendantUploadDocumentFormComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(DefendantUploadDocumentFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
