import { TestBed } from '@angular/core/testing';

import { PlusingSettingService } from './plusing-setting-service';

describe('PlusingSettingService', () => {
  let service: PlusingSettingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlusingSettingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
