import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PayoutsFeature } from './payouts-feature';

describe('PayoutsFeature', () => {
  let component: PayoutsFeature;
  let fixture: ComponentFixture<PayoutsFeature>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PayoutsFeature],
    }).compileComponents();

    fixture = TestBed.createComponent(PayoutsFeature);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
