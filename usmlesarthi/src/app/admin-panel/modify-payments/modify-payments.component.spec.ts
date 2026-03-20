import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModifyPaymentsComponent } from './modify-payments.component';

describe('ModifyPaymentsComponent', () => {
  let component: ModifyPaymentsComponent;
  let fixture: ComponentFixture<ModifyPaymentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModifyPaymentsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModifyPaymentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
