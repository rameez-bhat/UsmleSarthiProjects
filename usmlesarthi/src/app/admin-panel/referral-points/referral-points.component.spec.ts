import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReferralPointsComponent } from './referral-points.component';

describe('ReferralPointsComponent', () => {
  let component: ReferralPointsComponent;
  let fixture: ComponentFixture<ReferralPointsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReferralPointsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReferralPointsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
