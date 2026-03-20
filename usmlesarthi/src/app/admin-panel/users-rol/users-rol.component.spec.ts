import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UsersRolComponent } from './users-rol.component';

describe('UsersRolComponent', () => {
  let component: UsersRolComponent;
  let fixture: ComponentFixture<UsersRolComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UsersRolComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UsersRolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
