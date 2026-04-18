import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlusingGame } from './plusing-game';

describe('PlusingGame', () => {
  let component: PlusingGame;
  let fixture: ComponentFixture<PlusingGame>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlusingGame],
    }).compileComponents();

    fixture = TestBed.createComponent(PlusingGame);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
