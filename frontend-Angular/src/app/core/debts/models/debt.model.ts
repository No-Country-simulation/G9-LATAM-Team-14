export type DebtType = 'INSTALLMENT' | 'FIXED';
export type DebtPaymentMode = 'FIXED_TERM' | 'FREE_PAYMENT';
export type DebtStatus = 'ACTIVE' | 'PAID';

export interface Debt {
  id?: number;
  type: DebtType;
  category: string;
  totalAmount?: number;
  monthlyAmount: number;
  monthsTerm?: number;
  paidInstallments?: number;
  paymentMode?: DebtPaymentMode;
  startDate?: string;
  endDate?: string;
  isIndefinite?: boolean;
  status?: DebtStatus;
  userId?: number;
}

export interface CreateDebtRequest {
  type: DebtType;
  category: string;
  totalAmount?: number;
  monthlyAmount: number;
  monthsTerm?: number;
  paymentMode?: DebtPaymentMode;
  startDate?: string;
  endDate?: string;
  isIndefinite?: boolean;
  userId?: number;
}

export interface SingleDebtItemRequest {
  type?: string;
  category: string;
  amount: number | null;
}

export interface CreateBatchDebtsRequest {
  userId: number;
  debts: SingleDebtItemRequest[];
}

export interface DebtSummary {
  totalPendingAmount: number;
  totalMonthlyPayment: number;
  incomePercentage: number;
  estimatedFreeDate: string;
  monthsRemaining: number;
}

export interface DebtProjectionPoint {
  month: string;
  balance: number;
}

export interface DebtProjectionResponse {
  projection: DebtProjectionPoint[];
}
