/**
 * CLRAPE Amendment – shared routes and types (DRY).
 */

/** Contractor list row + optional detail fields for view/edit */
export interface Contractor {
  id: number;
  name: string;
  address: string;
  nature: string;
  // nature_of_work?: string;
  maxLabour: number;
  status: number | string;
  application_id?: string;
  is_from_v?: number;
  /** Present when this row amends an existing contractor. */
  contractorParentId?: string;
  formv_serial_number?: string;
  /** True when the contractor was carried over from before the amendment. */
  existedBeforeAmendment?: boolean;
  /** Form V number of the original row, shown instead of a second download. */
  formvReferenceNumber?: string;
  /** Server-side verdict on the Form V download (issued application + new contractor). */
  canDownloadFormV?: boolean;
  statusLabel?: string;
  identificationNumber?: string;
  /** Optional detail fields (view/edit forms) */
  email?: string;
  state?: string;
  /** Human-readable state name resolved from the state id (detail view). */
  stateName?: string;
  stateOpts?: number;
  districtCode?: string;
  subdivisionCode?: string;
  areaType?: string;
  areaCode?: string;
  villageWardCode?: string;
  policeStationCode?: string;
  pinCode?: string;
  natureOfWork?: string[];
  otherNatureWork?: string;
  employmentFrom?: string;
  employmentTo?: string;
  totalDays?: number;
  /** Worksite address (view/edit forms) */
  worksiteAddress?: string;
  worksiteDistrictCode?: string;
  worksiteSubdivisionCode?: string;
  worksiteAreaType?: string;
  worksiteAreaCode?: string;
  worksiteVillageWardCode?: string;
  worksitePoliceStationCode?: string;
  worksitePinCode?: string;
}

/** Query param for contractor tab */
export const TAB_CONTRACTOR = "contractor";

/** Contractor list (Amendment application page with contractor tab) */
export const ROUTE_CONTRACTOR_LIST = "/clra-reg-amendment/view-clra-application?tab=" + TAB_CONTRACTOR;

/** Add contractor form (no id – form is empty) */
export const ROUTE_ADD_CONTRACTOR = "/add-contractor-form";

/** Edit contractor form – navigate to /edit-contractor-form/:id (form fetches by id) */
export const ROUTE_EDIT_CONTRACTOR = "/edit-contractor-form";

/** View contractor details – navigate to /view-contractor-details/:id (page fetches by id) */
export const ROUTE_VIEW_CONTRACTOR = "/view-contractor-details";

/** Build view URL with contractor id */
export function getViewContractorPath(id: number | string): string {
  return `${ROUTE_VIEW_CONTRACTOR}/${id}`;
}

/** Build edit form URL with contractor id */
export function getEditContractorPath(id: number | string): string {
  return `${ROUTE_EDIT_CONTRACTOR}/${id}`;
}
