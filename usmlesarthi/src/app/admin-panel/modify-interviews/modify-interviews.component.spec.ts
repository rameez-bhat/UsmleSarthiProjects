import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModifyInterviewsComponent } from './modify-interviews.component';

describe('ModifyInterviewsComponent', () => {
  let component: ModifyInterviewsComponent;
  let fixture: ComponentFixture<ModifyInterviewsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModifyInterviewsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModifyInterviewsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
