export type RequestStatus = 'pending' | 'approved' | 'rejected';

export interface CreditRequest {
  id: number;
  cedula: string;
  amount: number;
  termMonths: number;
  status: RequestStatus;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCreditRequestPayload {
  cedula: string;
  amount: number;
  termMonths: number;
}

export interface UpdateStatusPayload {
  status: 'approved' | 'rejected';
  comment?: string;
}
