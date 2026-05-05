import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AssignmentsFeature } from './assignments-feature';

describe('AssignmentsFeature', () => {
  let component: AssignmentsFeature;
  let fixture: ComponentFixture<AssignmentsFeature>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignmentsFeature],
    }).compileComponents();

    fixture = TestBed.createComponent(AssignmentsFeature);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
