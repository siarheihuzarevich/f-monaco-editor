import {
  Component,
  ChangeDetectionStrategy,
  OnDestroy,
  ElementRef,
  Input,
  NgZone,
  AfterViewInit, forwardRef, Output, EventEmitter,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { createCodeEditor, ICodeEditor, IFCodeEditorOptions } from '../../domain';
import { FEditorLoadService } from './f-editor-load.service';
import { take } from 'rxjs';

@Component({
  selector: 'f-monaco-editor',
  template: '',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'style': 'display: block; height: 100%; width: 100%;',
    'role': 'input',
    'class': 'f-monaco-editor'
  },
  providers: [
    FEditorLoadService,
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FMonacoEditorComponent),
      multi: true
    }
  ]
})
export class FMonacoEditorComponent
    implements AfterViewInit, OnDestroy, ControlValueAccessor {

  // @Output()
  // public focusChanges: EventEmitter<boolean> = new EventEmitter<boolean>();

  @Output()
  public loaded: EventEmitter<ICodeEditor> = new EventEmitter<ICodeEditor>();

  private editor: ICodeEditor | undefined;

  public get hostElement(): HTMLElement {
    return this.elementReference.nativeElement;
  }

  @Input()
  public get value(): string | undefined {
    return this._value;
  }

  public set value(value: string | undefined) {
    if (value !== this._value) {
      this._value = value;
    }
  }

  private _value: string | undefined;

  private _onChange: (value: any) => void = () => {
  };

  private _onTouched = () => {
  };


  @Input({ required: true })
  public set options(options: IFCodeEditorOptions) {
    this._options = options;
    if (this.editor) {
      this.editor.dispose();
      this.initializeEditor();
    }
  }

  public get options(): IFCodeEditorOptions {
    return this._options;
  }

  private _options!: IFCodeEditorOptions;
  //
  // @Input({ transform: booleanAttribute })
  // public disabled: boolean = false;
  //
  // public focused: boolean = false;

  constructor(
      private fEditorLoad: FEditorLoadService,
      private elementReference: ElementRef<HTMLElement>,
      private zone: NgZone
  ) {
  }

  public ngAfterViewInit(): void {
    this.fEditorLoad.load().pipe(take(1)).subscribe(() => {
      this.initializeEditor();
    });
  }

  public writeValue(value: string): void {
    this.value = value;

    this.editor?.setValue(value);
  }

  public registerOnChange(fn: (value: any) => void): void {
    this._onChange = fn;
  }

  public registerOnTouched(fn: () => {}): void {
    this._onTouched = fn;
  }

  private initializeEditor(): void {
    this.editor = createCodeEditor(this.hostElement, this.options, this.value);
    this.loaded.emit(this.editor);

    this.editor!.onDidChangeModelContent(() => {

      const value = this.editor!.getValue();

      this.zone.run(() => {
        this._onChange(value);
        this.value = value;
      });
    });

    this.editor!.onDidBlurEditorWidget(() => {
      this._onTouched();
    });
  }


  // private onFocus(): void {
  //   if (!this.disabled) {
  //     this._focused = true;
  //     this.stateChanges.next();
  //     this.focusChanges.emit(true);
  //   }
  // }
  //
  // public focus(): void {
  //   if (this.editor && !this.disabled) {
  //     this.editor.focus();
  //   }
  // }
  //
  // private subscribeOnBlur(): void {
  //   this.editor?.onDidBlurEditorWidget(() => {
  //     this.onBlur();
  //   });
  // }
  //
  // private onBlur(): void {
  //   this._focused = false;
  //
  //   if (!this.disabled) {
  //     this.onTouched();
  //     this.changeDetectorRef.markForCheck();
  //     this.stateChanges.next();
  //     this.focusChanges.emit(false);
  //   }
  // }

  public ngOnDestroy(): void {
    this.editor?.dispose();
    this.editor = undefined;
  }
}
