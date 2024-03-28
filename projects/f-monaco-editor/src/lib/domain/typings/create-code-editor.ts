import { IFCodeEditorOptions } from './i-f-code-editor-options';
import { ICodeEditor } from './i-code-editor';
import { ICodeEditorTextModel } from './i-code-editor-text-model';

declare var monaco: {
    editor: {
        create: (htmlElement: HTMLElement, options: IFCodeEditorOptions) => ICodeEditor;
        createModel: (value: any, language: string) => ICodeEditorTextModel;
    };
};

export function createCodeEditor(htmlElement: HTMLElement, options: IFCodeEditorOptions, value: string | undefined): ICodeEditor {
  options.model = createModel(value, options.language!);
  return monaco.editor.create(htmlElement, options);
}

export function createModel(value: any, language: string): ICodeEditorTextModel {
  return monaco.editor.createModel(value, language);
}
