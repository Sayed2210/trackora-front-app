import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ShipmentsFeature } from './shipments-feature';

describe('ShipmentsFeature', () => {
  let component: ShipmentsFeature;
  let fixture: ComponentFixture<ShipmentsFeature>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShipmentsFeature],
    }).compileComponents();

    fixture = TestBed.createComponent(ShipmentsFeature);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
