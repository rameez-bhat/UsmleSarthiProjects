import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SarthiListComponent } from './sarthi-list.component';

describe('SarthiListComponent', () => {
  let component: SarthiListComponent;
  let fixture: ComponentFixture<SarthiListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SarthiListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SarthiListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
