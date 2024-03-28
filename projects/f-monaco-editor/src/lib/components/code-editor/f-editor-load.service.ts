import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { fromPromise } from 'rxjs/internal/observable/innerFrom';

let isEditorLoaded: boolean = false;
let fLoadEditor: Promise<void>;

interface Window {
  require: {
    (modules: string[], onLoad: () => void): void;
    config: (config: object) => void;
  };
  monaco: object | undefined;
}

declare var window: Window;

@Injectable()
export class FEditorLoadService {

  public load(): Observable<void> {
    if (!isEditorLoaded) {
      isEditorLoaded = true;
      fLoadEditor = new Promise<void>((x) => this.loadMonaco(x));
    }
    return fromPromise(fLoadEditor);
  }

  private loadMonaco(resolve: () =>  void): void {
    const src = './assets/monaco-editor/min/vs';
    if (typeof window.monaco === 'object') {
      resolve();
    } else {
      const definitions = () => this.loadDefinitions(resolve, src);

      if (!window.require) {
        this.loadScript(`${ src }/loader.js`, definitions);
      } else {
        definitions();
      }
    }
  }

  private loadDefinitions = (resolve: () =>  void, src: string) => {
    window.require.config({ paths: { 'vs': `${ src }` } });
    window.require([ `vs/editor/editor.main` ], () => {
      resolve();
    });
  }

  private loadScript(src: string, onLoad: () => void): void {
    const script: HTMLScriptElement = document.createElement('script');
    script.type = 'text/javascript';
    script.src = src;
    script.addEventListener('load', onLoad);
    document.body.appendChild(script);
  }
}
