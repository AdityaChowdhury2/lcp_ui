export interface ElectionForm {
  name: string;
  dob: string;
  title: string;
  electionDate: string;
  lastElectionDate: string;
  nextElectionDate: string;
  privateAddress: string;
  mobile: string;
  signature: FileList;
}

export interface ElectionRow {
  sl_no: number;
  name: string;
  date_of_birth: string;
  private_address: string;
  date_of_election: string;
  encrypted_id: string;
}

export interface NotificationState {
  type: "success" | "error" | null;
  message: string;
}
