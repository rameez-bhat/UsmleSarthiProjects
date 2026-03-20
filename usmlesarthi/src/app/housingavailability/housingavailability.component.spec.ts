import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HousingAvailabilityComponent } from './housingavailability.component';

describe('HousingAvailabilityComponent', () => {
  let component: HousingAvailabilityComponent;
  let fixture: ComponentFixture<HousingAvailabilityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HousingAvailabilityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HousingAvailabilityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
