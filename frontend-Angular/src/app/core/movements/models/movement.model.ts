export interface Movement {
  id: number;
  description: string;
  amount: number;
  type: 'INGRESO' | 'GASTO';
  category: string;
  date: string;
  userId?: number;
}

export interface CreateMovementRequest {
  description: string;
  amount: number;
  type: 'INGRESO' | 'GASTO';
  category: string;
  date: string;
  userId?: number;
}
