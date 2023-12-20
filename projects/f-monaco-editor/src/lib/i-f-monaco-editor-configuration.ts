import { editor } from 'monaco-editor';
import IStandaloneEditorConstructionOptions = editor.IStandaloneEditorConstructionOptions;
import { InjectionToken } from '@angular/core';

export const F_MONACO_EDITOR_CONFIGURATION: InjectionToken<IFMonacoEditorConfiguration> = new InjectionToken('F_MONACO_EDITOR_CONFIGURATION');

export interface IFMonacoEditorConfiguration extends IStandaloneEditorConstructionOptions {

}
