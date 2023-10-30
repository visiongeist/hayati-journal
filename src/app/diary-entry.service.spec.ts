import { TestBed } from '@angular/core/testing';

import { DiaryEntryService } from './diary-entry.service';

describe('DiaryEntryService', () => {
  let service: DiaryEntryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DiaryEntryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
