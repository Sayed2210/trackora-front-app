import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WalletFeature } from './wallet-feature';

describe('WalletFeature', () => {
  let component: WalletFeature;
  let fixture: ComponentFixture<WalletFeature>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WalletFeature],
    }).compileComponents();

    fixture = TestBed.createComponent(WalletFeature);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
