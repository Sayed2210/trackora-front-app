import { Location } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ForbiddenPageComponent } from './forbidden-page.component';

describe('ForbiddenPageComponent', () => {
  let fixture: ComponentFixture<ForbiddenPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ForbiddenPageComponent],
      providers: [{ provide: Location, useValue: { back: vi.fn() } }],
    }).compileComponents();

    fixture = TestBed.createComponent(ForbiddenPageComponent);
    fixture.detectChanges();
  });

  it('renders the Arabic forbidden message', () => {
    expect(fixture.nativeElement.textContent).toContain(
      'ليس لديك صلاحية للوصول لهذه الصفحة',
    );
  });
});
