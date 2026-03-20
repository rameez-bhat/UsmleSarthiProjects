import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InterviewsReportComponent } from './interviews-report.component';

describe('InterviewsReportComponent', () => {
  let component: InterviewsReportComponent;
  let fixture: ComponentFixture<InterviewsReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InterviewsReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InterviewsReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
