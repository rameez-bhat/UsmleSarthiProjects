import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignHospitalsComponent } from './assign-hospitals.component';

describe('AssignHospitalsComponent', () => {
  let component: AssignHospitalsComponent;
  let fixture: ComponentFixture<AssignHospitalsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssignHospitalsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssignHospitalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
