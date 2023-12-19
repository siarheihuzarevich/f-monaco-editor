import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  PM_MONACO_EDITOR_CONFIG,
  FMonacoEditorComponent,
  PmMonacoEditorConfig
} from './components/f-monaco-editor.component';

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [
    FMonacoEditorComponent
  ],
  exports: [
    FMonacoEditorComponent
  ]
})
export class FMonacoEditorModule {

  public static forRoot(config: PmMonacoEditorConfig = {}): ModuleWithProviders<FMonacoEditorModule> {
    return {
      ngModule: FMonacoEditorModule,
      providers: [
        { provide: PM_MONACO_EDITOR_CONFIG, useValue: config }
      ]
    };
  }
}
