import { TestBed } from '@angular/core/testing';

import { ObservablexService } from './observablex.service';

describe('ObservablexService', () => {
  let service: ObservablexService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ObservablexService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
