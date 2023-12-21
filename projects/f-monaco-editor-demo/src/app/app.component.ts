import { Component } from '@angular/core';
import { IFMonacoEditorConfiguration } from '../../../f-monaco-editor/src/lib/i-f-monaco-editor-configuration';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'f-monaco-editor-demo';

  public configuration: IFMonacoEditorConfiguration = {
    theme: 'vs-dark',
    language: 'sql',
    automaticLayout: true,
    minimap: { enabled: false },
    contextmenu: false,
    lineNumbers: 'on',
    lineDecorationsWidth: 0,
  }
}
