import { ReactElement } from "react";

export interface SecurityForm {
  particulars: string;
  faceValue: string;
  costPrice: string;
  marketPrice: string;
  inHand: string;
}

export interface SecurityRow {
  sl_no: number;
  particulars: string | ReactElement;
  face_value: number;
  cost_price: number;
  market_price: number;
  in_hand: string;
  encrypted_id: string;
}

export interface NotificationState {
  type: "success" | "error" | null;
  message: string;
}
