import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EnrollmentMentorComponent } from './enrollment-mentor.component';

describe('EnrollmentMentorComponent', () => {
  let component: EnrollmentMentorComponent;
  let fixture: ComponentFixture<EnrollmentMentorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EnrollmentMentorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnrollmentMentorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
