import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CourierTasksFeature } from './courier-tasks-feature';

describe('CourierTasksFeature', () => {
  let component: CourierTasksFeature;
  let fixture: ComponentFixture<CourierTasksFeature>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CourierTasksFeature],
    }).compileComponents();

    fixture = TestBed.createComponent(CourierTasksFeature);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
