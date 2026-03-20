import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ROLDataComponent } from './roldata.component';

describe('ROLDataComponent', () => {
  let component: ROLDataComponent;
  let fixture: ComponentFixture<ROLDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ROLDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ROLDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
