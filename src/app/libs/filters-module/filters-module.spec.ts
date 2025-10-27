import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FiltersModuleComponent } from './filters-module';

describe('FiltersModuleComponent', () => {
  let component: FiltersModuleComponent;
  let fixture: ComponentFixture<FiltersModuleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FiltersModuleComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FiltersModuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
