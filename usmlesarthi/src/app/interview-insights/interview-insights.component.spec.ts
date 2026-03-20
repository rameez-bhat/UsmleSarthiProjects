import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InterviewInsightsComponent } from './interview-insights.component';

describe('InterviewInsightsComponent', () => {
  let component: InterviewInsightsComponent;
  let fixture: ComponentFixture<InterviewInsightsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InterviewInsightsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InterviewInsightsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
