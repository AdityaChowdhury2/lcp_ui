import axios from "axios";
import { API_BASE } from "@/constants/constants";
import { getAuthToken } from "@/utils/auth";
import { generateFormIPdfTemplate } from "@/Admin/Pages/CLRAPEApplication/ClraPePdfTemplates";

/**
 * Single source of truth for the CLRA Form-I PDF.
 *
 * The applicant (Upload Signed Form-I) and the ALC (View Amended Application) must see the
 * very same document, so both build it from one mapping over the
 * `clra/applications/:applicationId/:userId/general-details` response and render it through
 * the same server-side Playwright endpoint. Keeping a second copy of this mapping is what
 * previously left the ALC's Form-I without the maximum contract labour and the treasury amount.
 */

const toLocaleDate = (value: unknown): string =>
  value ? new Date(value as string).toLocaleDateString() : "";

/** Maps a `general-details` response onto the fields `generateFormIPdfTemplate` renders. */
export const buildClraFormIPdfData = (applicationData: any) => {
  const establishmentData = applicationData?.establishment;

  return {
    establishmentName: establishmentData?.name?.value,
    establishmentAddress: `${establishmentData?.locationAddress?.value?.name}`,
    postalAddress: `${establishmentData?.postalAddress?.value?.address}`,
    principalEmployerName: applicationData?.principalEmployer?.name?.value,
    principalEmployerAddress: applicationData?.principalEmployer?.address?.value,
    managerName: applicationData?.managers?.name?.value,
    managerAddress: `${applicationData?.managers?.address?.value?.address}`,
    natureOfWork: applicationData?.natureofworks?.value,
    maxDirectWorkers: applicationData?.workmanDetails?.anydaymaxworkmen?.value,
    permanentWorkers: applicationData?.workmanDetails?.workmenreg?.value,
    temporaryWorkers: applicationData?.workmanDetails?.tempOrRegularCount?.value,
    sameWork: applicationData?.workmanDetails?.sameOrSimilarWork?.value === 1 ? "Yes" : "No",
    jobDescription: applicationData?.workmanDetails?.jobDescription?.value,
    wageBenefits: applicationData?.workmanDetails?.wageAndBenefits?.value,
    categoryDesignation: applicationData?.workmanDetails?.categoryDesignation?.value,

    maxContractLabour: applicationData?.workmanDetails?.maxNumberOfContractLabour?.value ?? "",
    registrationNo: applicationData?.applicationStatus?.registrationNumber ?? "",
    registrationDate: toLocaleDate(applicationData?.applicationStatus?.registrationDate),
    applicationDate: new Date().toLocaleDateString(),

    contractors: applicationData?.contractorsInfo?.map((con: any) => ({
      name: con.name_of_contractor ?? "",
      address: con.address_of_contractor ?? "",
      nature: con.natureofwork ?? "",
      maxLabour: con.contractor_max_no_of_labours_on_any_day ?? "",
      from: toLocaleDate(con.est_date_of_work_of_each_labour_from_date),
      to: toLocaleDate(con.est_date_of_work_of_each_labour_to_date),
    })),

    tradeUnions: applicationData?.tradeUnions?.map((tu: any) => ({
      regnNo: tu.e_trade_union_regn_no ?? "",
      name: tu.e_trade_union_name ?? "",
      address: tu.e_trade_union_address ?? "",
    })) ?? [],

    treasuryAmount: applicationData?.paymentDetails?.amountPayable ?? "",
  };
};

/**
 * Renders the Form-I HTML to PDF on the server and shows it in `targetTab`.
 *
 * The tab has to be opened by the click handler itself (a user gesture) so pop-up blockers
 * allow it; this only redirects that tab once the PDF is ready.
 */
export const openClraFormIPdf = async (
  applicationData: any,
  targetTab: Window | null,
): Promise<void> => {
  const html = generateFormIPdfTemplate(buildClraFormIPdfData(applicationData));

  const response = await axios.post(
    `${API_BASE}applicant-module/form-i-pdf`,
    { html },
    {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
        "Content-Type": "application/json",
      },
      responseType: "blob",
    },
  );

  const blobUrl = URL.createObjectURL(
    new Blob([response.data], { type: "application/pdf" }),
  );

  if (targetTab && !targetTab.closed) {
    targetTab.location.href = blobUrl;
  } else {
    window.open(blobUrl, "_blank");
  }
};

/** Placeholder tab content while the server renders the PDF. */
export const writeFormIPdfTabPlaceholder = (tab: Window | null): void => {
  tab?.document.write(
    "<title>FORM I</title><p style='font-family:sans-serif;padding:24px;color:#333'>Generating Form-I PDF&hellip;</p>",
  );
};
