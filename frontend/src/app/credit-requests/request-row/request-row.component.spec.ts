import { TestBed, ComponentFixture } from '@angular/core/testing';
import { RequestRowComponent } from './request-row.component';
import type { CreditRequest } from '../../core/models/credit-request.model';

const pendingRequest: CreditRequest = {
  id: 1,
  cedula: '8-123-456',
  amount: 5000,
  termMonths: 12,
  status: 'pending',
  comment: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const approvedRequest: CreditRequest = {
  ...pendingRequest,
  id: 2,
  status: 'approved',
  comment: 'Aprobado sin observaciones',
};

const rejectedRequest: CreditRequest = {
  ...pendingRequest,
  id: 3,
  status: 'rejected',
  comment: 'Documentación incompleta',
};

describe('RequestRowComponent', () => {
  let fixture: ComponentFixture<RequestRowComponent>;
  let component: RequestRowComponent;

  function createWithRequest(req: CreditRequest): void {
    fixture = TestBed.createComponent(RequestRowComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('request', req);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RequestRowComponent],
    }).compileComponents();
  });

  it('should create', () => {
    createWithRequest(pendingRequest);
    expect(component).toBeTruthy();
  });

  it('should display cedula', () => {
    createWithRequest(pendingRequest);
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('8-123-456');
  });

  it('should show Aprobar and Rechazar buttons for pending requests', () => {
    createWithRequest(pendingRequest);
    const buttons = fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>;
    const texts = Array.from(buttons).map((b) => b.textContent?.trim());
    expect(texts).toContain('Aprobar');
    expect(texts).toContain('Rechazar');
  });

  it('should show Cerrada for approved requests', () => {
    createWithRequest(approvedRequest);
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Cerrada');
    const buttons = el.querySelectorAll('button');
    expect(buttons.length).toBe(0);
  });

  it('should show Cerrada for rejected requests', () => {
    createWithRequest(rejectedRequest);
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Cerrada');
  });

  it('should emit approve event with request id', () => {
    createWithRequest(pendingRequest);
    let emittedId: number | undefined;
    component.approve.subscribe((id) => (emittedId = id));

    const approveBtn = (fixture.nativeElement as HTMLElement)
      .querySelectorAll('button')[0] as HTMLButtonElement;
    approveBtn.click();

    expect(emittedId).toBe(1);
  });

  it('should emit reject event with request id', () => {
    createWithRequest(pendingRequest);
    let emittedId: number | undefined;
    component.reject.subscribe((id) => (emittedId = id));

    const rejectBtn = (fixture.nativeElement as HTMLElement)
      .querySelectorAll('button')[1] as HTMLButtonElement;
    rejectBtn.click();

    expect(emittedId).toBe(1);
  });

  it('should show comment for rejected request', () => {
    createWithRequest(rejectedRequest);
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Documentación incompleta');
  });

  it('should show comment for approved request', () => {
    createWithRequest(approvedRequest);
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Aprobado sin observaciones');
  });

  it('should show pending status badge', () => {
    createWithRequest(pendingRequest);
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Pendiente');
  });

  it('should show approved status badge', () => {
    createWithRequest(approvedRequest);
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Aprobada');
  });

  it('should show rejected status badge', () => {
    createWithRequest(rejectedRequest);
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Rechazada');
  });
});
