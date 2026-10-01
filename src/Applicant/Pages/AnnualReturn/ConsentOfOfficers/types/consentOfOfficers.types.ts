export interface ConsentForm {
  name: string;
  designation: string;
  mobile: string;
  signature: FileList;
}

export interface ConsentRow {
  sl_no: number;
  name: string;
  mobile: string;
  designation: string;
  encrypted_id: string;
}

export interface NotificationState {
  type: "success" | "error" | null;
  message: string;
}
