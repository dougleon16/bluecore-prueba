import { Component, DestroyRef, inject, output, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { CreditRequestsService } from '../credit-requests.service';
import type { CreditRequest } from '../../core/models/credit-request.model';

@Component({
  selector: 'app-create-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './create-form.component.html',
})
export class CreateFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(CreditRequestsService);

  readonly created = output<CreditRequest>();
  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  private static readonly CEDULA_REGEX = /^(?:[1-9]|PE|E|N)-(?:\d{1,4})-\d{1,6}$/i;

  private static integerValidator(control: AbstractControl): ValidationErrors | null {
    const val = control.value;
    if (val === null || val === undefined || val === '') return null;
    return Number.isInteger(Number(val)) ? null : { integer: true };
  }

  readonly form = this.fb.group({
    cedula: ['', [Validators.required, Validators.pattern(CreateFormComponent.CEDULA_REGEX)]],
    amount: [
      null as number | null,
      [Validators.required, Validators.min(500), Validators.max(50000)],
    ],
    termMonths: [
      null as number | null,
      [
        Validators.required,
        Validators.min(6),
        Validators.max(60),
        CreateFormComponent.integerValidator,
      ],
    ],
  });

  constructor() {
    const destroyRef = inject(DestroyRef);
    const sub = this.form.valueChanges.subscribe(() => this.errorMessage.set(null));
    destroyRef.onDestroy(() => sub.unsubscribe());
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { cedula, amount, termMonths } = this.form.getRawValue();
    this.loading.set(true);
    this.errorMessage.set(null);
    this.service.create({ cedula: cedula!, amount: amount!, termMonths: termMonths! }).subscribe({
      next: (request) => {
        this.loading.set(false);
        this.form.reset();
        this.created.emit(request);
      },
      error: (err: { error?: { message?: string } }) => {
        this.loading.set(false);
        this.errorMessage.set(err.error?.message ?? 'Error al crear la solicitud.');
      },
    });
  }
}
