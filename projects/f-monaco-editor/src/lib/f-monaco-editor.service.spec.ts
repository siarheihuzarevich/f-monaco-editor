import { TestBed } from '@angular/core/testing';

import { FMonacoEditorService } from './f-monaco-editor.service';

describe('FMonacoEditorService', () => {
  let service: FMonacoEditorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FMonacoEditorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
