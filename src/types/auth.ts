export interface User {
  uid?: string;
  name?: string;
  mail?: string; // backend uses `mail`
  role?: number; // role id saved in localStorage
  isSliApplicant?: boolean;
  // any other fields from backend can be added here
}