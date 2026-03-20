import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ObservershipComponent } from './observership.component';

describe('ObservershipComponent', () => {
  let component: ObservershipComponent;
  let fixture: ComponentFixture<ObservershipComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ObservershipComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ObservershipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
