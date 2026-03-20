import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InterviewsDataComponent } from './interviews-data.component';

describe('InterviewsDataComponent', () => {
  let component: InterviewsDataComponent;
  let fixture: ComponentFixture<InterviewsDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InterviewsDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InterviewsDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
