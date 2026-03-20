import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RotationAvailabilityComponent } from './rotationsavailability.component';

describe('RotationAvailabilityComponent', () => {
  let component: RotationAvailabilityComponent;
  let fixture: ComponentFixture<RotationAvailabilityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RotationAvailabilityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RotationAvailabilityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
