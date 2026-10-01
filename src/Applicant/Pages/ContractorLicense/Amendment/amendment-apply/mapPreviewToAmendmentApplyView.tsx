import type { ReactNode } from "react";
import type { AmendmentApplyDocLink, AmendmentApplyRow, AmendmentApplyViewModel } from "./amendmentApplyTypes";
import { numberToWordsEn } from "./numberToWordsEn";

export type AmendmentApplyMapSlots = {
  /** Replaces plain “View Details” for previous establishments (e.g. React Router link). */
  previousEstablishments?: ReactNode;
};

function str(v: unknown): string {
  if (v == null || v === "") return "";
  return String(v);
}

function displayOrDash(v: unknown): string {
  const s = str(v);
  return s || "—";
}

function formatGbDate(v: unknown): string {
  if (v == null || v === "") return "—";
  const d = v instanceof Date ? v : new Date(String(v));
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

/** Legacy `dS M Y` banner style e.g. `02ND SEP 2023` */
export function formatLegacyBannerDate(v: unknown): string {
  if (v == null || v === "") return "—";
  const d = new Date(String(v));
  if (Number.isNaN(d.getTime())) return "—";
  const day = d.getDate();
  const ord =
    day % 10 === 1 && day !== 11
      ? "ST"
      : day % 10 === 2 && day !== 12
        ? "ND"
        : day % 10 === 3 && day !== 13
          ? "RD"
          : "TH";
  const mon = d.toLocaleDateString("en-GB", { month: "short" }).toUpperCase();
  return `${String(day).padStart(2, "0")}${ord} ${mon} ${d.getFullYear()}`;
}

function categoryContractorLabel(v: unknown): string {
  if (v == null || v === "" || v === 0 || v === "0" || v === false) return "Individuals";
  return "Company";
}

function wageCell(v: unknown): string {
  const s = str(v);
  if (!s) return "Nil";
  return `₹ ${s}`;
}

function docLink(
  label: string,
  href: unknown,
  displayName: unknown,
  defaultLinkText: string,
  fid: number = 0,
): AmendmentApplyDocLink {
  const h = str(href);
  return {
    fid: fid,
    label,
    href: h || null,
    linkText: h ? str(displayName) || defaultLinkText : "",
  };
}

/**
 * Maps `contractor-license/amendment/details` content (or any compatible snapshot) into the legacy grid.
 */
export function mapPreviewToAmendmentApplyView(
  preview: Record<string, unknown> | null,
  slots?: AmendmentApplyMapSlots,
): AmendmentApplyViewModel {
  const p = preview ?? {};

  const establishmentAddress = [
    str(p.est_name),
    str(p.loc_e_name),
    [str(p.loc_e_dist), str(p.loc_e_subdivision)].filter(Boolean).join(", "),
    [str(p.loc_e_gp_ward), str(p.loc_e_ps), str(p.loc_e_pin_number)].filter(Boolean).join(", "),
  ]
    .filter((x) => x)
    .join("\n");

  const certLine = `Registration Number: ${displayOrDash(p.pe_registration_no)}\nDate of Certificate: ${formatGbDate(p.pe_registration_date)}\nUnder The CLRA Act`;

  const principalBlock = [str(p.pe_name), str(p.pe_address)].filter(Boolean).join("\n");

  const peContractorName = str(p.name_of_contractor);
  const peContractorAddr = [
    str(p.address_of_contractor),
    [str(p.contractor_dist), str(p.contractor_subdivision)].filter(Boolean).join(", "),
  ]
    .filter(Boolean)
    .join("\n");

  const maxPe = displayOrDash(p.contractor_max_no_of_labours_on_any_day);
  const natureWork = displayOrDash(p.nature_of_work_contract ?? p.nature_of_work);

  const fromD = formatGbDate(p.est_date_of_work_of_each_labour_from_date);
  const toD = formatGbDate(p.est_date_of_work_of_each_labour_to_date);
  const duration =
    fromD !== "—" && toD !== "—"
      ? `${fromD} To ${toD}${str(p.duration_of_the_proposed_contract_work) ? ` (${str(p.duration_of_the_proposed_contract_work)} months)` : ""}`
      : "—";

  const contractorAddressBlock = [
    str(p.address_of_contractor),
    [str(p.contractor_dist), str(p.contractor_subdivision)].filter(Boolean).join(", "),
    [str(p.contractor_gp_ward), str(p.contractor_ps), str(p.contractor_pin)].filter(Boolean).join(", "),
  ]
    .filter(Boolean)
    .join("\n");

  const dobRaw = p.dob_contractor;
  const dobStr = dobRaw ? formatGbDate(dobRaw) : "—";
  const ageStr = displayOrDash(p.age_contractor);
  const dobTitle = "Date of Birth / Age";

  const worksiteBlock = [
    str(p.worksite_address_line),
    [str(p.worksite_dist), str(p.worksite_subdivision)].filter(Boolean).join(", "),
    [str(p.work_site_gp_ward), str(p.worksite_ps), str(p.worksite_pin)].filter(Boolean).join(", "),
  ]
    .filter(Boolean)
    .join("\n");

  const maxLab = Number(p.contractor_max_no_of_labours_on_any_day);
  const maxLabWords = Number.isFinite(maxLab) && maxLab >= 0 ? numberToWordsEn(maxLab) : "";
  const maxLabDisplay =
    str(p.contractor_max_no_of_labours_on_any_day) &&
    `${str(p.contractor_max_no_of_labours_on_any_day)}${maxLabWords ? ` (${maxLabWords})` : ""}`;

  const managerAddr = [
    str(p.address_of_manager),
    [str(p.contractor_manager_dist), str(p.contractor_manager_subdivision)].filter(Boolean).join(", "),
    [str(p.contractor_managerr_gp_ward), str(p.contractor_manager_ps), str(p.manager_pin)].filter(Boolean).join(", "),
  ]
    .filter(Boolean)
    .join("\n");

  const spread = str(p.spred_over) || str((p as { spred_over?: unknown }).spred_over) || "—";
  const overtimeHrs = str(p.overtime) || "—";
  const otWages = str(p.overtime_wages) || "—";

  const earnedLeave = str(p.earned_leave_no ?? p.eraned_leave_no);

  const totalHoliday = str(p.no_holiday);
  const nameHolidays = str(p.weekly_holiday) || "NIL";
  const holidayWages = str((p as { holiday_wages?: unknown }).holiday_wages) || "—";

  const revokingDate = formatGbDate((p as { details_contractor_revoking?: unknown }).details_contractor_revoking);

  const specialBen = str((p as { special_benifites?: unknown }).special_benifites) || "Nil";
  const miscProv = str((p as { miscellaneous_provisions?: unknown }).miscellaneous_provisions) || "Nil";
  const stateIns = str((p as { state_insurance?: unknown }).state_insurance) || "Nil";

  const workOrderUrl = str(p.work_order_file_url);
  const formVUrl = str((p as { frm_v_file_url?: unknown }).frm_v_file_url);
  const residentialUrl = str((p as { residential_file_url?: unknown }).residential_file_url);
  const otherUrl = str(p.other_file_url);

  const documents: AmendmentApplyDocLink[] = [
    docLink("Work Order", workOrderUrl, p.work_order_file_display_name, "View Work Order", Number(p.work_order_file_id)),
    docLink("Form V", formVUrl, (p as { frm_v_file_display_name?: unknown }).frm_v_file_display_name, "View Form V"),
    docLink(
      "Residential Certificate/Tread License",
      residentialUrl,
      (p as { residential_file_display_name?: unknown }).residential_file_display_name,
      "View Residential Certificate/Tread License",
    ),
    docLink("Other Document", otherUrl, p.other_file_display_name, "View Other Document", Number(p.other_file_id)),
  ];

  const amendRef =
    p.amendment_reference_no != null && str(p.amendment_reference_no)
      ? str(p.amendment_reference_no)
      : "";

  const section1: AmendmentApplyRow[] = [
    ...(amendRef
      ? ([
          {
            label: "Amendment application reference",
            value: amendRef,
          },
        ] as AmendmentApplyRow[])
      : []),
    {
      label: "Name & address of the establishment of Principal Employer",
      value: establishmentAddress || "—",
    },
    {
      label:
        "Type of Business, trade, industry, manufacture or occupation which is carried on in the establishment(P.E.)",
      value: natureWork,
    },
    { label: "Number and date of Certificate", value: certLine },
    { label: "Name & Address of the Principal Employer", value: principalBlock || "—" },
    {
      label: "Name & Address of Contractor",
      value: [peContractorName, peContractorAddr].filter(Boolean).join("\n") || "—",
    },
    {
      label: "Maximum number of Contract Labour proposed to he employed in the establishment on any date",
      value: maxPe,
    },
    {
      label: "Nature of work in which Contract Labour is employed or is to be employed in the establishment",
      value: natureWork,
    },
    {
      label: "Duration of the proposed contract work(give particulars of proposed date of ending) ",
      value: duration,
    },
  ];

  const section2: AmendmentApplyRow[] = [
    { label: "Name", value: displayOrDash(p.name_of_contractor) },
    { label: "Address of Contractor", value: contractorAddressBlock || "—" },
    { label: "Father name of contarctor", value: displayOrDash(p.father_contarctor_name) },
    { label: "Category of Contractor", value: categoryContractorLabel(p.category_of_contractor) },
    {
      label: dobTitle,
      value: (
        <>
          {dobStr}
          <br />
          {ageStr}
        </>
      ),
    },
  ];

  const section3: AmendmentApplyRow[] = [
    { label: "Work site Address", value: worksiteBlock || "—" },
    {
      label: "Maximum number of Contract Labour proposed to he employed in the establishment on any date",
      value: maxLabDisplay || "—",
    },
  ];

  const section4BeforeWages: AmendmentApplyRow[] = [
    {
      label: "Name & address of the agent or Manager of Contractor at the work site",
      value: (
        <>
          {displayOrDash(p.name_of_manager)}
          <br />
          {managerAddr || "—"}
        </>
      ),
    },
    {
      label:
        "Category/designation/ nomenclature of the contractor labour, namely, fitter,welder,carpenter, mazdor etc",
      value: displayOrDash(p.category_designation),
    },
  ];

  const wageRows: AmendmentApplyRow[] = [
    {
      label: "(a)Rate of Wages,DA and other cash benefits paid/ to be paid to Unskilled of contract labour",
      value: wageCell(p.unskilled_rate_wages),
    },
    {
      label: "(b)Rate of Wages,DA and other cash benefits paid/ to be paid to Semi-skilled of contract labour",
      value: wageCell(p.semiskilled_rate_wages),
    },
    {
      label: "(c)Rate of Wages,DA and other cash benefits paid/ to be paid to Skilled of contract labour",
      value: wageCell(p.skilled_rate_wages),
    },
    {
      label: "(d)Rate of Wages,DA and other cash benefits paid/ to be paid to Highly-skilled of contract labour",
      value: wageCell(p.highlyskilled_rate_wages),
    },
  ];

  const hoursRow: AmendmentApplyRow = {
    label: "(e)Hours of Work, Spread over time, Overtime and Overtime Wages ",
    value: (
      <>
        Hours of Work:- {displayOrDash(p.hours_work)} hr(s)
        <br /> Spread over time:- {spread} hr(s)
        <br /> Overtime:- {overtimeHrs} hr(s)
        <br />
        Overtime Wages:- ₹ {otWages} (per hour)
      </>
    ),
  };

  const leaveRows: AmendmentApplyRow[] = [
    { label: "(a)Number of Annual leave", value: displayOrDash(p.annual_leave_no) },
    { label: "(b)Number of Casual leave", value: displayOrDash(p.casual_leave_no) },
    { label: "(c)Number of Earned leave", value: earnedLeave || "—" },
    { label: "(d)Number of Sick leave", value: displayOrDash(p.sick_leave_no) },
    { label: "(e)Number of Maternity leave", value: displayOrDash(p.maternity_leave_no) },
    { label: "(f)Number of Other leave", value: displayOrDash(p.other_leave_no) },
    {
      label: "Whether weekly holiday(s) observed and on which day",
      value: `${totalHoliday || "—"} day(s)(${nameHolidays})`,
    },
    {
      label: "Whether weekly holiday(s) so observed was paid holiday(s)",
      value: holidayWages,
    },
    {
      label:
        "Whether the contractor was convicted of any offence within the preceding five years. If so, give details",
      value: displayOrDash(p.details_contractor_convicted),
    },
    {
      label:
        "Whether there was any order against the contract or revoking or suspending license or forfeiting security deposit in respect of an earlier contract. If so, the date of such order11",
      value: `Revoking Date :- ${revokingDate}`,
    },
    {
      label:
        "Whether the contractor has worked in any other establishment within the past five years. If so. give details of the principal employer, establishment and nature of work",
      value: slots?.previousEstablishments ?? "View Details",
    },
    { label: "Special benefits provided, if any ", value: specialBen },
    {
      label: "Contribution made under the Employees Provident Fund and Miscellaneous Provision Act,1952 ",
      value: miscProv,
    },
    {
      label: "Contribution made under the Employees State Insurance Act,1948",
      value: stateIns,
    },
  ];

  return {
    section1,
    section2,
    section3,
    section3DueSecurity: str(p.due_security_fees_note) || null,
    section4BeforeWages,
    wagesBannerTitle:
      "Rate of Wages,DA and other cash benefits paid/ to be paid to each category of contract labour i.e (a):Unskilled (b)Semi Skilled (c)Skilled (d)Highly Skilled etc.)",
    wageRows,
    hoursRow,
    leaveBannerTitle:
      "Other Condition of service like leave (annual leave,casual leave,sick leave,maternity leave etc.) Holidays etc.of the contract labour",
    leaveRows,
    documents,
  };
}


