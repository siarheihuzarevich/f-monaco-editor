import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { createModel, ICodeEditor, IFCodeEditorOptions } from '@foblex/monaco-editor';
import { MatCheckboxChange } from '@angular/material/checkbox';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: [ './app.component.scss' ]
})
export class AppComponent {

  public languages: string[] = [ 'sql', 'javascript', 'typescript', 'html', 'css' ];

  private editor: ICodeEditor | undefined;

  public options: IFCodeEditorOptions = {
    theme: 'vs-dark',
    language: 'sql',
    automaticLayout: true,
    minimap: { enabled: false },
    contextmenu: false,
    lineNumbers: 'on',
    lineDecorationsWidth: 0,
  };

  public form: FormGroup = new FormGroup({
    editor: new FormControl(''),
  });

  public onEditorLoaded(editor: ICodeEditor): void {
    this.editor = editor;
  }

  public onLanguageChanged(language: string): void {
    this.editor?.setModel(createModel(this.form.get('editor')?.value, language));
  }

  public onMinimapChanged(event: MatCheckboxChange): void {
    this.editor?.updateOptions({
      minimap: {
        enabled: event.checked
      }
    })
  }
}
