import { TestBed, ComponentFixture } from '@angular/core/testing';
import { RequestTableComponent } from './request-table.component';
import type { CreditRequest, RequestStatus } from '../../core/models/credit-request.model';

const make = (id: number, status: RequestStatus, cedula = '8-123-456'): CreditRequest => ({
  id,
  cedula,
  amount: 1000,
  termMonths: 12,
  status,
  comment: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
});

const requests: CreditRequest[] = [
  make(1, 'pending', '8-111-111'),
  make(2, 'approved', '8-222-222'),
  make(3, 'rejected', '8-333-333'),
];

describe('RequestTableComponent', () => {
  let fixture: ComponentFixture<RequestTableComponent>;
  let component: RequestTableComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RequestTableComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RequestTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show empty state when no requests', () => {
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('No hay solicitudes');
  });

  it('should show loading state', () => {
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Cargando');
  });

  it('should display all requests when no search term', () => {
    fixture.componentRef.setInput('requests', requests);
    fixture.detectChanges();
    expect(component.displayedRequests().length).toBe(3);
  });

  it('should filter by cedula when search term is set', () => {
    fixture.componentRef.setInput('requests', requests);
    component.searchTerm.set('8-111');
    expect(component.displayedRequests().length).toBe(1);
    expect(component.displayedRequests()[0].cedula).toBe('8-111-111');
  });

  it('should filter by id when search term is numeric', () => {
    fixture.componentRef.setInput('requests', requests);
    component.searchTerm.set('2');
    const results = component.displayedRequests();
    expect(results.some((r) => r.id === 2)).toBe(true);
  });

  it('should return empty list when no match', () => {
    fixture.componentRef.setInput('requests', requests);
    component.searchTerm.set('XXXXXXX');
    expect(component.displayedRequests().length).toBe(0);
  });

  it('setFilter() should update activeFilter', () => {
    component.setFilter('pending');
    expect(component.activeFilter()).toBe('pending');
  });

  it('setFilter() should emit filterChange with undefined for empty string', () => {
    let emitted: RequestStatus | undefined = 'pending';
    component.filterChange.subscribe((v) => (emitted = v));
    component.setFilter('');
    expect(emitted).toBeUndefined();
  });

  it('setFilter() should emit filterChange with status value', () => {
    let emitted: RequestStatus | undefined;
    component.filterChange.subscribe((v) => (emitted = v));
    component.setFilter('approved');
    expect(emitted).toBe('approved');
  });

  it('FILTERS should contain Todas, Pendientes, Aprobadas, Rechazadas', () => {
    const labels = component.FILTERS.map((f) => f.label);
    expect(labels).toContain('Todas');
    expect(labels).toContain('Pendientes');
    expect(labels).toContain('Aprobadas');
    expect(labels).toContain('Rechazadas');
  });

  it('onSearch() should update searchTerm from input event', () => {
    const event = { target: { value: 'searchtext' } } as unknown as Event;
    component.onSearch(event);
    expect(component.searchTerm()).toBe('searchtext');
  });

  it('approve output should bubble up from row', () => {
    fixture.componentRef.setInput('requests', requests);
    fixture.detectChanges();
    let emitted: number | undefined;
    component.approve.subscribe((id) => (emitted = id));
    component.approve.emit(1);
    expect(emitted).toBe(1);
  });

  it('reject output should bubble up from row', () => {
    fixture.componentRef.setInput('requests', requests);
    fixture.detectChanges();
    let emitted: number | undefined;
    component.reject.subscribe((id) => (emitted = id));
    component.reject.emit(2);
    expect(emitted).toBe(2);
  });
});
