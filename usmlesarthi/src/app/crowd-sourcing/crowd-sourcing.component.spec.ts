import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CrowdSourcingComponent } from './crowd-sourcing.component';

describe('CrowdSourcingComponent', () => {
  let component: CrowdSourcingComponent;
  let fixture: ComponentFixture<CrowdSourcingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CrowdSourcingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CrowdSourcingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
