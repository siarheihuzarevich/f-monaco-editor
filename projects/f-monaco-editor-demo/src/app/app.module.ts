import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { FMonacoEditorModule } from '@foblex/monaco-editor';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FMonacoEditorModule
  ],
  providers: [],
  bootstrap: [ AppComponent ]
})
export class AppModule {
}
