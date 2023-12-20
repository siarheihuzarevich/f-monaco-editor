import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FMonacoEditorComponent } from './f-monaco-editor.component';
import { F_MONACO_EDITOR_CONFIGURATION, IFMonacoEditorConfiguration } from './i-f-monaco-editor-configuration';

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

  public static forRoot(configuration: IFMonacoEditorConfiguration = {}): ModuleWithProviders<FMonacoEditorModule> {
    return {
      ngModule: FMonacoEditorModule,
      providers: [
        { provide: F_MONACO_EDITOR_CONFIGURATION, useValue: configuration }
      ]
    };
  }
}
