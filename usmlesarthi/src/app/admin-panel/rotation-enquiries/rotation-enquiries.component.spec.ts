import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RotationEnquiriesComponent } from './rotation-enquiries.component';

describe('RotationEnquiriesComponent', () => {
  let component: RotationEnquiriesComponent;
  let fixture: ComponentFixture<RotationEnquiriesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RotationEnquiriesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RotationEnquiriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
