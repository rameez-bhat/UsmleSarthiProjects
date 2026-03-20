import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModifyHousingComponent } from './modify-housing.component';

describe('ModifyHousingComponent', () => {
  let component: ModifyHousingComponent;
  let fixture: ComponentFixture<ModifyHousingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModifyHousingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModifyHousingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
