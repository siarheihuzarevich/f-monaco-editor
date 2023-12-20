import { ErrorStateMatcher } from '@angular/material/core';
import { AbstractControl, FormGroupDirective, NgControl, NgForm } from '@angular/forms';
import { Subject } from 'rxjs';

export class ErrorStateTracker {

  public get errorState(): boolean {
    return this.isErrorState;
  }

  private isErrorState: boolean = false;

  private _matcher: ErrorStateMatcher | undefined;

  public get matcher(): ErrorStateMatcher {
    return this._matcher || this.defaultMatcher;
  }

  public set matcher(value: ErrorStateMatcher) {
    this._matcher = value;
  }

  private get control(): AbstractControl | null {
    return this.ngControl ? (this.ngControl.control as AbstractControl) : null;
  }

  private get form(): FormGroupDirective | NgForm | null {
    return this.parentFormGroup || this.parentForm;
  }

  constructor(
    private defaultMatcher: ErrorStateMatcher,
    private ngControl: NgControl | null,
    private parentFormGroup: FormGroupDirective | null,
    private parentForm: NgForm | null,
    private stateChanges: Subject<void>,
  ) {
  }

  public setErrorState(value: boolean): void {
    this.isErrorState = value;
  }

  public updateErrorState(): void {
    const isErrorState = this.getNewErrorState();

    if (isErrorState !== this.isErrorState) {
      this.isErrorState = isErrorState;
      this.stateChanges.next();
    }
  }

  private getNewErrorState(): boolean {

    const matcher = this.matcher || this.defaultMatcher;

    const isErrorStateFunction = typeof matcher?.isErrorState === 'function';

    const result = isErrorStateFunction ? matcher.isErrorState(this.control, this.form) : false;

    return result;
  }
}
