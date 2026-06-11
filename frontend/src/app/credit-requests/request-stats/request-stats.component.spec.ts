import { TestBed, ComponentFixture } from '@angular/core/testing';
import { RequestStatsComponent } from './request-stats.component';
import type { CreditRequest } from '../../core/models/credit-request.model';

const make = (status: CreditRequest['status'], id = 1): CreditRequest => ({
  id,
  cedula: '8-123-456',
  amount: 1000,
  termMonths: 12,
  status,
  comment: null,
  createdAt: '',
  updatedAt: '',
});

describe('RequestStatsComponent', () => {
  let fixture: ComponentFixture<RequestStatsComponent>;
  let component: RequestStatsComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RequestStatsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RequestStatsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show zero counts when list is empty', () => {
    fixture.detectChanges();
    expect(component.pendingCount()).toBe(0);
    expect(component.approvedCount()).toBe(0);
    expect(component.rejectedCount()).toBe(0);
  });

  it('should count pending requests correctly', () => {
    fixture.componentRef.setInput('requests', [make('pending', 1), make('pending', 2), make('approved', 3)]);
    fixture.detectChanges();
    expect(component.pendingCount()).toBe(2);
  });

  it('should count approved requests correctly', () => {
    fixture.componentRef.setInput('requests', [make('approved', 1), make('approved', 2)]);
    fixture.detectChanges();
    expect(component.approvedCount()).toBe(2);
  });

  it('should count rejected requests correctly', () => {
    fixture.componentRef.setInput('requests', [make('rejected', 1), make('pending', 2)]);
    fixture.detectChanges();
    expect(component.rejectedCount()).toBe(1);
  });

  it('should render correct counts in the DOM', () => {
    fixture.componentRef.setInput('requests', [
      make('pending', 1),
      make('approved', 2),
      make('approved', 3),
      make('rejected', 4),
    ]);
    fixture.detectChanges();

    const cells = fixture.nativeElement.querySelectorAll('p.font-display') as NodeListOf<HTMLElement>;
    const texts = Array.from(cells).map((el) => el.textContent?.trim());
    expect(texts).toContain('1');
    expect(texts).toContain('2');
  });

  it('should handle mixed statuses independently', () => {
    fixture.componentRef.setInput('requests', [
      make('pending', 1),
      make('pending', 2),
      make('pending', 3),
      make('approved', 4),
      make('rejected', 5),
      make('rejected', 6),
    ]);
    fixture.detectChanges();
    expect(component.pendingCount()).toBe(3);
    expect(component.approvedCount()).toBe(1);
    expect(component.rejectedCount()).toBe(2);
  });
});
