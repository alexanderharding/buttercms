import { TestBed } from '@angular/core/testing';

import { AbortSignalInteropService } from './abort-signal-interop.service';

describe('AbortSignalInteropService', () => {
  let service: AbortSignalInteropService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AbortSignalInteropService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
