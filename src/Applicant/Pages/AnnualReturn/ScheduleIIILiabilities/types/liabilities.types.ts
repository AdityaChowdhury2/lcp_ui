export interface FieldConfig {
  label: string;
  fieldId: number;
  flag: "L" | "A";
  key: string;
}

export interface LiabilityState {
  applicationId: number | null;
  generalFund: number | string;
  politicalFund: number | string;
  loanFrom: number;
  debtsDue: number;
  otherLiabilities: number;
  total: number;
  assetLiabilityDate: number | null;
}

export interface AssetState {
  cash: number;
  inHands: number;
  securities: number;
  unpaidSubscription: number;
  loansTo: number;
  immovableProperties: number;
  goodsFurniture: number;
  otherAssets: number;
  total: number;
}

export interface ModalRow {
  id: number;
  details: string;
  amount: number;
}

export interface NotificationState {
  type: "success" | "error" | null;
  message: string;
}
