import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddHospitalsComponent } from './add-hospitals.component';

describe('AddHospitalsComponent', () => {
  let component: AddHospitalsComponent;
  let fixture: ComponentFixture<AddHospitalsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddHospitalsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddHospitalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
