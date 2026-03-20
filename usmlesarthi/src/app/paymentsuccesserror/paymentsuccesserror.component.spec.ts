import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentSuccessErrorComponent } from './paymentsuccesserror.component';

describe('PaymentSuccessErrorComponent', () => {
  let component: PaymentSuccessErrorComponent;
  let fixture: ComponentFixture<PaymentSuccessErrorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PaymentSuccessErrorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentSuccessErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
