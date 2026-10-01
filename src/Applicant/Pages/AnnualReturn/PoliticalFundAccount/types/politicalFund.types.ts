export interface IncomeRow {
  id: number;
  description: string;
  amount: number | string;
  hasModal: boolean;
}

export interface ExpRow {
  id: number;
  description: string;
  amount: number;
  hasModal: boolean;
}

export interface ModalRow {
  id: string | number;
  sl: number;
  description: string;
  amount: number;
}

export interface NotificationState {
  type: "success" | "error" | null;
  message: string;
}
