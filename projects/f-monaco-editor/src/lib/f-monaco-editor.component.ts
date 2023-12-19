import {
  AfterViewInit, Attribute, booleanAttribute, ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component, DoCheck,
  ElementRef,
  EventEmitter,
  forwardRef,
  Input,
  NgZone, numberAttribute, OnChanges,
  OnDestroy, OnInit, Optional,
  Output, Self
} from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  FormGroupDirective,
  NG_VALUE_ACCESSOR,
  NgControl,
  NgForm
} from '@angular/forms';
import { fromEvent, Subject, Subscription, takeUntil } from 'rxjs';
import { editor, IDisposable, ISelection, Position } from 'monaco-editor';
import IStandaloneCodeEditor = editor.IStandaloneCodeEditor;
import { IFMonacoEditorOptions } from './i-f-monaco-editor-options';
import

  declare

var monaco: any;

let loadedMonaco = false;
let loadPromise: Promise<void>;

export interface PmMonacoEditorConfig {
  baseUrl?: string;
  defaultOptions?: { [ key: string ]: any; };
  onMonacoLoad?: Function;
}

@Component({
  selector: 'f-monaco-editor',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'role': 'input',
    'class': 'f-monaco-editor',
    '[attr.id]': 'id',
    'ngSkipHydration': '',
    '[class.f-monaco-editor-disabled]': 'disabled',
    '[class.f-monaco-editor-invalid]': 'errorState',
    '[class.f-monaco-editor-empty]': 'empty'
  },
  providers: [ {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => FMonacoEditorComponent),
    multi: true
  } ]
})
export class FMonacoEditorComponent implements OnChanges,
                                               OnDestroy,
                                               OnInit,
                                               DoCheck,
                                               ControlValueAccessor {

  @Input()
  public get id(): string {
    return this._id;
  }

  public set id(value: string) {
    this._id = value || this._uid;
    this.stateChanges.next();
  }

  private _id!: string;

  private _uid = `f-monaco-editor-${ nextUniqueId++ }`;

  @Output()
  public focusChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  @Output()
  public initialized: EventEmitter<IStandaloneCodeEditor> = new EventEmitter<IStandaloneCodeEditor>();

  private editor: IStandaloneCodeEditor | undefined;

  private _previousControl: AbstractControl | null | undefined;

  protected readonly _destroy: Subject<void> = new Subject<void>();

  private _errorStateTracker: _ErrorStateTracker;

  public readonly stateChanges: Subject<void> = new Subject<void>();

  _onChange: (value: any) => void = () => {
  };

  _onTouched = () => {
  };

  _valueId = `f-monaco-editor-value-${ nextUniqueId++ }`;

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
    const hasAssigned = this._assignValue(newValue);

    if (hasAssigned) {
      this._onChange(newValue);
    }
  }

  private _value: any;

  @Output()
  public readonly valueChange: EventEmitter<any> = new EventEmitter<any>();

  @Input()
  public get errorStateMatcher() {
    return this._errorStateTracker.matcher;
  }

  public set errorStateMatcher(value: ErrorStateMatcher) {
    this._errorStateTracker.matcher = value;
  }

  /** Whether the select is in an error state. */
  get errorState() {
    return this._errorStateTracker.errorState;
  }

  set errorState(value: boolean) {
    this._errorStateTracker.errorState = value;
  }

  private _options: IFMonacoEditorOptions = {};

  @Input()
  public set options(options: IFMonacoEditorOptions) {
    this._options = options;

    if (this.editor) {
      this.disposeEditor();
      this.initializeEditor(options);
    }
  }

  public get options(): IFMonacoEditorOptions {
    return this._options;
  }

  private get hostElement(): HTMLElement {
    return this.elementReference.nativeElement;
  }

  constructor(
    protected _viewportRuler: ViewportRuler,
    protected _changeDetectorRef: ChangeDetectorRef,
    protected _ngZone: NgZone,
    defaultErrorStateMatcher: ErrorStateMatcher,
    readonly _elementRef: ElementRef,
    @Optional() parentForm: NgForm,
    @Optional() parentFormGroup: FormGroupDirective,
    @Self() @Optional() public ngControl: NgControl,
    @Attribute('tabindex') tabIndex: string,
    private _liveAnnouncer: LiveAnnouncer,
    @Optional() @Inject(MAT_SELECT_CONFIG) protected _defaultOptions?: MatSelectConfig,
  ) {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }

    this._errorStateTracker = new _ErrorStateTracker(
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
    this._viewportRuler
      .change()
      .pipe(takeUntil(this._destroy))
      .subscribe(() => {
        if (this.editor) {
          //relayout
          this._changeDetectorRef.detectChanges();
        }
      });


    if (loadedMonaco) {
      loadPromise.then(() => {
        this.hideSpinner();
        this.initializeEditor(this.options);
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
            this.hideSpinner();
            this.initializeEditor(this.options);
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

  public writeValue(value: any | undefined): void {

  }

  public registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  public registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  private initializeEditor(options: IFMonacoEditorOptions): void {
    this.editor = monaco.editor.create(this.hostElement, options) as IStandaloneCodeEditor;

    this.subscribeOnBlur();
  }


  private subscribeOnBlur(): void {
    this.editor?.onDidBlurEditorWidget(() => {
      this.onTouched();
    });
  }

  public ngOnDestroy(): void {
    this.resizeSubscription$.unsubscribe();

    this.disposeEditor();
  }

  private disposeEditor(): void {
    this.editor?.dispose();
    this.editor = undefined;
  }
}
