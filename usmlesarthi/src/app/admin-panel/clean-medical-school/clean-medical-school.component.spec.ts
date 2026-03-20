import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CleanMedicalSchoolComponent } from './clean-medical-school.component';

describe('CleanMedicalSchoolComponent', () => {
  let component: CleanMedicalSchoolComponent;
  let fixture: ComponentFixture<CleanMedicalSchoolComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CleanMedicalSchoolComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CleanMedicalSchoolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
