export interface FormData {
  name: string;
  office: string;
  date: string;
}

export interface OfficerRow {
  id: number;
  sl: number;
  name: string;
  office: string;
  date: string;
}

export interface NotificationState {
  type: "success" | "error" | null;
  message: string;
}
