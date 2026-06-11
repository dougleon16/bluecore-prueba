import { TestBed, ComponentFixture } from '@angular/core/testing';
import { RejectModalComponent } from './reject-modal.component';

describe('RejectModalComponent', () => {
  let fixture: ComponentFixture<RejectModalComponent>;
  let component: RejectModalComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RejectModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RejectModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the modal title', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Rechazar solicitud');
  });

  it('form should be invalid when empty', () => {
    expect(component.form.invalid).toBe(true);
  });

  it('form should be invalid when comment is too short', () => {
    component.form.get('comment')!.setValue('ab');
    expect(component.form.invalid).toBe(true);
    expect(component.form.get('comment')!.hasError('minlength')).toBe(true);
  });

  it('form should be valid when comment has 5+ characters', () => {
    component.form.get('comment')!.setValue('Motivo válido');
    expect(component.form.valid).toBe(true);
  });

  it('submit() should mark form as touched when invalid', () => {
    component.submit();
    expect(component.form.get('comment')!.touched).toBe(true);
  });

  it('submit() should emit confirmed with comment when valid', () => {
    let emittedComment: string | undefined;
    component.confirmed.subscribe((v) => (emittedComment = v));

    component.form.get('comment')!.setValue('Documentación incompleta');
    component.submit();

    expect(emittedComment).toBe('Documentación incompleta');
  });

  it('submit() should reset form after emitting', () => {
    component.confirmed.subscribe(() => {});
    component.form.get('comment')!.setValue('Motivo claro aquí');
    component.submit();
    expect(component.form.get('comment')!.value).toBeFalsy();
  });

  it('cancel() should emit cancelled', () => {
    let emitted = false;
    component.cancelled.subscribe(() => (emitted = true));
    component.cancel();
    expect(emitted).toBe(true);
  });

  it('cancel() should reset form', () => {
    component.form.get('comment')!.setValue('Algún texto');
    component.cancel();
    expect(component.form.get('comment')!.value).toBeFalsy();
  });

  it('clicking backdrop should call cancel()', () => {
    let emitted = false;
    component.cancelled.subscribe(() => (emitted = true));

    const backdrop = (fixture.nativeElement as HTMLElement).querySelector('.absolute.inset-0') as HTMLElement;
    backdrop.click();

    expect(emitted).toBe(true);
  });

  it('clicking Cancelar button should call cancel()', () => {
    let emitted = false;
    component.cancelled.subscribe(() => (emitted = true));

    const cancelBtn = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('button'),
    ).find((b) => b.textContent?.includes('Cancelar')) as HTMLButtonElement;
    cancelBtn.click();

    expect(emitted).toBe(true);
  });

  it('should show required error when touched with empty value', () => {
    component.form.get('comment')!.markAsTouched();
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('obligatorio');
  });

  it('should show minlength error for short input', () => {
    component.form.get('comment')!.setValue('ab');
    component.form.get('comment')!.markAsTouched();
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('5 caracteres');
  });
});
