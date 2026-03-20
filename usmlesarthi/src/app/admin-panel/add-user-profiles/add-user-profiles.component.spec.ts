import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddUserProfilesComponent } from './add-user-profiles.component';

describe('AddUserProfilesComponent', () => {
  let component: AddUserProfilesComponent;
  let fixture: ComponentFixture<AddUserProfilesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddUserProfilesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddUserProfilesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
