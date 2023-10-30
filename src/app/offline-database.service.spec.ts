import { TestBed } from '@angular/core/testing';

import { OfflineDatabaseService } from './offline-database.service';

describe('OfflineDatabaseService', () => {
  let service: OfflineDatabaseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OfflineDatabaseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
