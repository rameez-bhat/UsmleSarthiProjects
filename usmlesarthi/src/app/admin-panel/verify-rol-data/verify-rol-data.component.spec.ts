import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VerifyRolDataComponent } from './verify-rol-data.component';

describe('VerifyRolDataComponent', () => {
  let component: VerifyRolDataComponent;
  let fixture: ComponentFixture<VerifyRolDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VerifyRolDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VerifyRolDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
