import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddRotationsComponent } from './add-rotations.component';

describe('AddRotationsComponent', () => {
  let component: AddRotationsComponent;
  let fixture: ComponentFixture<AddRotationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddRotationsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddRotationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
