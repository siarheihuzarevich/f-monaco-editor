import {
  Attribute,
  booleanAttribute,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  NgZone, numberAttribute, OnChanges,
  OnDestroy, OnInit, Optional,
  Output, Self, SimpleChanges
} from '@angular/core';
import {
  ControlValueAccessor,
  FormGroupDirective,
  NgControl,
  NgForm
} from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { editor } from 'monaco-editor';
import IStandaloneCodeEditor = editor.IStandaloneCodeEditor;
import { F_MONACO_EDITOR_CONFIGURATION, IFMonacoEditorConfiguration } from './i-f-monaco-editor-configuration';
import { ViewportRuler } from '@angular/cdk/overlay';
import { ErrorStateMatcher } from '@angular/material/core';
import { ErrorStateTracker } from './error-state-tracker';

declare var monaco: any;

let loadedMonaco = false;
let loadPromise: Promise<void>;

let nextUniqueId = 0;

@Component({
  selector: 'f-monaco-editor',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'role': 'input',
    'class': 'f-monaco-editor',
    '[attr.id]': 'id',
    'ngSkipHydration': '',
    '[class.f-monaco-editor-focused]': 'focused',
    '[class.f-monaco-editor-disabled]': 'disabled',
    '[class.f-monaco-editor-invalid]': 'errorState',
    '[class.f-monaco-editor-empty]': '!value',
  }
})
export class FMonacoEditorComponent implements OnChanges,
                                               OnDestroy,
                                               OnInit,
                                               ControlValueAccessor {

  private _id!: string;

  private uid = `f-monaco-editor-${ nextUniqueId++ }`;

  @Input()
  public get id(): string {
    return this._id;
  }

  public set id(value: string) {
    this._id = value || this.uid;
    this.stateChanges.next();
  }

  private _focused: boolean = false;

  public get focused(): boolean {
    return this._focused;
  }

  @Output()
  public focusChanges: EventEmitter<boolean> = new EventEmitter<boolean>();

  @Output()
  public loaded: EventEmitter<IStandaloneCodeEditor> = new EventEmitter<IStandaloneCodeEditor>();

  private editor: IStandaloneCodeEditor | undefined;

  protected readonly destroy: Subject<void> = new Subject<void>();

  private errorStateTracker: ErrorStateTracker;

  public readonly stateChanges: Subject<void> = new Subject<void>();

  private onChange: (value: any) => void = () => {
  };

  private onTouched = () => {
  };

  @Input({ transform: booleanAttribute })
  public disabled: boolean = false;

  @Input({
    transform: (value: unknown) => (value == null ? 0 : numberAttribute(value)),
  })
  public tabIndex: number = 0;

  @Input()
  public get value(): any {
    return this._value;
  }

  public set value(newValue: any) {
    const hasAssigned = this.assignValue(newValue);

    if (hasAssigned) {
      this.onChange(newValue);
    }
  }

  private _value: any;

  @Output()
  public readonly valueChange: EventEmitter<any> = new EventEmitter<any>();

  @Input()
  public get errorStateMatcher() {
    return this.errorStateTracker.matcher;
  }

  public set errorStateMatcher(value: ErrorStateMatcher) {
    this.errorStateTracker.matcher = value;
  }

  public set errorState(value: boolean) {
    this.errorStateTracker.setErrorState(value);
  }

  public get errorState() {
    return this.errorStateTracker.errorState;
  }

  private _configuration: IFMonacoEditorConfiguration | undefined;

  @Input()
  public set configuration(configuration: IFMonacoEditorConfiguration) {
    this._configuration = configuration;

    if (this.editor) {
      this.disposeEditor();
      this.initializeEditor(configuration);
    }
  }

  public get configuration(): IFMonacoEditorConfiguration {
    return this._configuration || this.defaultConfiguration;
  }

  private get hostElement(): HTMLElement {
    return this.elementReference.nativeElement;
  }

  constructor(
    public elementReference: ElementRef,
    protected viewportRuler: ViewportRuler,
    protected changeDetectorRef: ChangeDetectorRef,
    protected ngZone: NgZone,
    defaultErrorStateMatcher: ErrorStateMatcher,
    @Optional() parentForm: NgForm,
    @Optional() parentFormGroup: FormGroupDirective,
    @Self() @Optional() public ngControl: NgControl,
    @Attribute('tabindex') tabIndex: string,
    @Optional() @Inject(F_MONACO_EDITOR_CONFIGURATION) private defaultConfiguration: IFMonacoEditorConfiguration,
  ) {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }

    this.errorStateTracker = new ErrorStateTracker(
      defaultErrorStateMatcher,
      ngControl,
      parentFormGroup,
      parentForm,
      this.stateChanges,
    );
    this.tabIndex = parseInt(tabIndex) || 0;

    this.id = this.id;
  }

  public ngOnInit(): void {
    this.subscribeOnViewportChanges();

    if (loadedMonaco) {
      loadPromise.then(() => {
        this.initializeEditor(this.configuration);
      });
    } else {
      loadedMonaco = true;
      loadPromise = new Promise<void>((resolve: any) => {
        const baseUrl = ('./assets') + '/monaco-editor/min/vs';
        if (typeof ((<any>window).monaco) === 'object') {
          resolve();
          return;
        }
        const onGotAmdLoader: any = () => {
          (<any>window).require.config({ paths: { 'vs': `${ baseUrl }` } });
          (<any>window).require([ `vs/editor/editor.main` ], () => {
            this.initializeEditor(this.configuration);
            resolve();
          });
        };

        // Load AMD loader if necessary
        if (!(<any>window).require) {
          const loaderScript: HTMLScriptElement = document.createElement('script');
          loaderScript.type = 'text/javascript';
          loaderScript.src = `${ baseUrl }/loader.js`;
          loaderScript.addEventListener('load', onGotAmdLoader);
          document.body.appendChild(loaderScript);
        } else {
          onGotAmdLoader();
        }
      });
    }
  }

  private subscribeOnViewportChanges(): void {
    this.viewportRuler
      .change()
      .pipe(takeUntil(this.destroy))
      .subscribe(() => {
        if (this.editor) {
          this.editor.layout()
          this.changeDetectorRef.detectChanges();
        }
      });
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes[ 'disabled' ]) {
      this.stateChanges.next();
    }
  }

  public writeValue(value: any): void {
    this.assignValue(value);
  }

  public registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn: () => {}): void {
    this.onTouched = fn;
  }

  public setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.changeDetectorRef.markForCheck();
    this.stateChanges.next();
  }

  public updateErrorState(): void {
    this.errorStateTracker.updateErrorState();
  }

  private assignValue(newValue: any): boolean {
    if (newValue !== this._value) {
      if (this.editor) {
        this.setTextValue(newValue);
      }

      this._value = newValue;
      return true;
    }
    return false;
  }

  private initializeEditor(configuration: IFMonacoEditorConfiguration): void {
    this.editor = monaco.editor.create(this.hostElement, configuration) as IStandaloneCodeEditor;

    this.setTextValue(this.value);

    this.subscribeOnContentChange();

    this.subscribeOnFocus();

    this.subscribeOnBlur();

    this.loaded.emit(this.editor);
  }

  private setTextValue(value: any): void {
    if (!this.editor) {
      throw new Error('Editor is not initialized');
    }
    this.editor.setValue(value || '');
    this.editor.setPosition({ column: 1, lineNumber: 1 });
    this.editor.setScrollPosition({ scrollTop: 0 });
    this.editor.focus();
  }

  private subscribeOnContentChange(): void {
    this.editor?.onDidChangeModelContent((e: any) => {
      this.ngZone.run(() => {
        this.propagateChanges(this.editor?.getValue());
      });
    });
  }

  private propagateChanges(value: any): void {
    this._value = value;
    this.valueChange.emit(value);
    this.onChange(value);
  }

  private subscribeOnFocus(): void {
    this.editor?.onDidFocusEditorWidget(() => {
      this.onFocus();
    });
  }

  private onFocus(): void {
    if (!this.disabled) {
      this._focused = true;
      this.stateChanges.next();
      this.focusChanges.emit(true);
    }
  }

  public focus(): void {
    if (this.editor && !this.disabled) {
      this.editor.focus();
    }
  }

  private subscribeOnBlur(): void {
    this.editor?.onDidBlurEditorWidget(() => {
      this.onBlur();
    });
  }

  private onBlur(): void {
    this._focused = false;

    if (!this.disabled) {
      this.onTouched();
      this.changeDetectorRef.markForCheck();
      this.stateChanges.next();
      this.focusChanges.emit(false);
    }
  }

  public ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
    this.stateChanges.complete();

    this.disposeEditor();
  }

  private disposeEditor(): void {
    this.editor?.dispose();
    this.editor = undefined;
  }
}
