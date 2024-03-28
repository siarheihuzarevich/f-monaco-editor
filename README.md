# FMonacoEditor

This is a Monaco Editor component for Angular 16+.

## Installation

```bash
npm install @foblex/monaco-editor
```

Add this to your `angular.json` file in the `assets` array:

```json
{
  "glob": "**/*",
  "input": "node_modules/monaco-editor/min/vs",
  "output": "/assets/monaco"
}
```

## Usage

```typescript
import { FMonacoEditorComponent } from '@foblex/monaco-editor';

@NgModule({
  import: [
    FMonacoEditorComponent
  ]
})
```

```typescript
public options: IFCodeEditorOptions = {
  language: 'sql'
}
```

```html
<f-monaco-editor [(ngModel)]="value" [options]="options"></f-monaco-editor>
```
