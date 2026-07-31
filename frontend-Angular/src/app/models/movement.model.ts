export interface Movement {
  id: number;
  description: string;
  amount: number;
  type: 'INGRESO' | 'GASTO';
  category: string;
  date: string;
}
