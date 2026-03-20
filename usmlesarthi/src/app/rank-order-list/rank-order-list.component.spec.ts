import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RankOrderListComponent } from './rank-order-list.component';

describe('RankOrderListComponent', () => {
  let component: RankOrderListComponent;
  let fixture: ComponentFixture<RankOrderListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RankOrderListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RankOrderListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
