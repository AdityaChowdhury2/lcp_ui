export interface OfficersAppointedForm {
  name: string;
  dob: string;
  privateAddress: string;
  personalOccupation: string;
  titlePosition: string;
  appointmentDate: string;
  otherOffice: string;
}

export interface OfficerRow {
  slNo: number;
  name: string;
  dob: string;
  personal_occupation: string;
  tital_position: string;
  date_appointment_was_taken: string;
  other_office: string;
  encrypted_id: string;
}

export interface NotificationState {
  type: "success" | "error" | null;
  message: string;
}
