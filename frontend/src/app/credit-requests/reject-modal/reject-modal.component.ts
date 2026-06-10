import { Component, inject, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-reject-modal',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './reject-modal.component.html',
})
export class RejectModalComponent {
  private readonly fb = inject(FormBuilder);

  readonly confirmed = output<string>();
  readonly cancelled = output<void>();

  readonly form = this.fb.group({
    comment: ['', [Validators.required, Validators.minLength(5)]],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.confirmed.emit(this.form.getRawValue().comment!);
    this.form.reset();
  }

  cancel(): void {
    this.form.reset();
    this.cancelled.emit();
  }
}
