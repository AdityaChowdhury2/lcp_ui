export interface IncomeRow {
  id: number;
  label: string;
  amount: number;
  hasDescription: boolean;
}

export interface ExpRow {
  id: number;
  label: string;
  amount: number;
  hasDescription: boolean;
}

export interface ModalRow {
  id: number | string;
  sl: number;
  description: string;
  amount: number;
}

export interface NotificationState {
  type: "success" | "error" | null;
  message: string;
}
