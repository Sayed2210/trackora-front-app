import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TrackingFeature } from './tracking-feature';

describe('TrackingFeature', () => {
  let component: TrackingFeature;
  let fixture: ComponentFixture<TrackingFeature>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrackingFeature],
    }).compileComponents();

    fixture = TestBed.createComponent(TrackingFeature);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
