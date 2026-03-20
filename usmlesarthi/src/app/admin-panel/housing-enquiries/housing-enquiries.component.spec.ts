import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HousingEnquiriesComponent } from './housing-enquiries.component';

describe('HousingEnquiriesComponent', () => {
  let component: HousingEnquiriesComponent;
  let fixture: ComponentFixture<HousingEnquiriesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HousingEnquiriesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HousingEnquiriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
