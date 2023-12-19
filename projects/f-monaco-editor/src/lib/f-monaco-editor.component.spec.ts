import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FMonacoEditorComponent } from './f-monaco-editor.component';

describe('FMonacoEditorComponent', () => {
  let component: FMonacoEditorComponent;
  let fixture: ComponentFixture<FMonacoEditorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FMonacoEditorComponent]
    });
    fixture = TestBed.createComponent(FMonacoEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
