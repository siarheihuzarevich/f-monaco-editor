import { Component, OnDestroy, OnInit } from '@angular/core';
import { IFMonacoEditorConfiguration } from '@foblex/monaco-editor';
import { FormControl, FormGroup } from '@angular/forms';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: [ './app.component.scss' ]
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'f-monaco-editor-demo';

  public configuration: IFMonacoEditorConfiguration = {
    theme: 'vs-dark',
    language: 'sql',
    automaticLayout: true,
    minimap: { enabled: false },
    contextmenu: false,
    lineNumbers: 'on',
    lineDecorationsWidth: 0,
  };

  public form: FormGroup = new FormGroup({
    language: new FormControl('sql'),
    editor: new FormGroup({}),
  });

  public ngOnInit(): void {
  }

  public ngOnDestroy(): void {

  }
}
