import React, { useMemo } from "react";

export type ContractorLicenseDocument = {
  fid?: string | number | null;
  uri?: string | null;
  filename?: string | null;
};

type ContractorLicenseDetailsViewProps = {
  preview: any | null;
  formVSerialNo?: number | string | null;
  workOrderDoc?: ContractorLicenseDocument | null;
  showExtendedWorkOrderRow?: boolean;
  onOpenManagedDocument: (fid: string) => void;
};

type DetailRow = {
  label: React.ReactNode;
  value: React.ReactNode;
};

type DetailSectionProps = {
  title: string;
  rows: DetailRow[];
};

function toPublicFileUrl(uri: unknown): string | null {
  const raw = String(uri ?? "").trim();
  if (!raw) return null;
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  if (raw.startsWith("public://"))
    return `/sites/default/files/${raw.slice("public://".length)}`;
  if (raw.startsWith("/")) return raw;
  return `/${raw}`;
}

function formatDate(value: unknown): string {
  const raw = String(value ?? "").trim();
  if (!raw) return "-";
  const dt = new Date(raw);
  if (Number.isNaN(dt.getTime())) return raw;
  return dt.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function valueOrNil(value: unknown): string {
  const raw = String(value ?? "").trim();
  return raw || "Nil";
}

const DetailSection: React.FC<DetailSectionProps> = ({ title, rows }) => (
  <div className="border rounded-lg shadow">
    <div className="bg-blue-400 text-white px-4 py-2 font-semibold rounded-t-lg">
      {title}
    </div>
    <div className="p-4 overflow-x-auto">
      <table className="w-full border text-sm">
        <tbody>
          <tr className="bg-gray-100">
            <td className="border p-2 w-[45%] font-semibold">Parameters</td>
            <td className="border p-2 font-semibold">Inputs</td>
          </tr>
          {rows.map((row, index) => (
            <tr key={`${title}-${index}`}>
              <td className="border p-2">{row.label}</td>
              <td className="border p-2">{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const ContractorLicenseDetailsView: React.FC<
  ContractorLicenseDetailsViewProps
> = ({
  preview,
  formVSerialNo,
  workOrderDoc,
  showExtendedWorkOrderRow = false,
  onOpenManagedDocument,
}) => {
  const docsSummary = preview?.documentsSummary ?? null;
  // console.log(docsSummary);

  const effectiveWorkOrderDoc =
    workOrderDoc ?? preview?.documents?.workOrder ?? null;
  const formViiReady = Boolean(
    preview?.documents?.formVii?.fid || preview?.documents?.formVii?.uri,
  );

  const weeklyHolidays = useMemo(() => {
    const days = Array.isArray(preview?.leaves?.weeklyHolidays)
      ? preview.leaves.weeklyHolidays
      : [];
    if (!days.length) return "Nil";
    return `${days.length} day(s) (${days.join(", ")})`;
  }, [preview]);

  const contractorWorksite =
    preview?.contractor?.worksiteAddress ??
    preview?.establishment?.location ??
    null;
  const businessType = preview?.establishment?.businessType ?? null;
  const natureOfWork = preview?.contractor?.natureOfWork ?? null;

  const documentCell = (
    doc: ContractorLicenseDocument | null | undefined,
    emptyText = "No Document uploaded",
  ) => {
    const url = toPublicFileUrl(doc?.uri);
    if (!url) return <span>{emptyText}</span>;
    return (
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="text-sky-700 hover:underline"
      >
        {`View ${doc?.filename || "document"}`}
      </a>
    );
  };

  const managedDocumentCell = (
    doc: ContractorLicenseDocument | null | undefined,
    emptyText = "No Document uploaded",
  ) => {
    const fid = doc?.fid;
    if (!fid) return documentCell(doc, emptyText);
    return (
      <button
        type="button"
        className="text-sky-700 hover:underline"
        onClick={() => {
          onOpenManagedDocument(String(fid));
        }}
      >
        {`View ${doc?.filename || "document"}`}
      </button>
    );
  };

  const uploadedDocumentRows: DetailRow[] = [
    {
      label: "Previous Work Order",
      value: managedDocumentCell(effectiveWorkOrderDoc),
    },
    ...(showExtendedWorkOrderRow
      ? [
          {
            label: "Extended Work Order",
            value: managedDocumentCell(effectiveWorkOrderDoc),
          },
        ]
      : []),
    { label: "FORM-V", value: documentCell(preview?.documents?.formV) },
    {
      label: "Residential Certificate/Trade License",
      value: documentCell(preview?.documents?.residential),
    },
    {
      label: "FORM-VII",
      value: formViiReady
        ? managedDocumentCell(preview?.documents?.formVii)
        : "FORM-VII will be uploaded by the applicant after fees submission",
    },
    {
      label: "Previous License or Renewal or Amendment Certificate",
      value: documentCell(preview?.documents?.signedLicense),
    },
    {
      label: "Renewal Certificate",
      value: documentCell(preview?.documents?.renewalCertificate),
    },
  ];

  return (
    <>
      <div className="text-center mb-6">
        <div className="text-lg bg-gray-50 border p-3 font-semibold rounded">
          Form-V/Reference Number:
          <span className="text-black ml-2">
            {formVSerialNo ? `00${formVSerialNo}` : "NA"}
          </span>
        </div>
      </div>

      <div className="space-y-6">
        <DetailSection
          title="Principal Employer Information"
          rows={[
            {
              label: "Name & Address of the Establishment",
              value: (
                <>
                  {valueOrNil(preview?.establishment?.name)}
                  <br />
                  {valueOrNil(preview?.establishment?.location)}
                </>
              ),
            },
            {
              label: "Name & Address of the Principal Employer",
              value: (
                <>
                  {valueOrNil(preview?.establishment?.principalEmployerName)}
                  <br />
                  {valueOrNil(preview?.establishment?.principalEmployerAddress)}
                </>
              ),
            },
            {
              label:
                "Type of Business, trade, industry, manufacture or occupation which is carried on in the establishment",
              value: valueOrNil(businessType),
            },
            {
              label: "Number and date of Certificate",
              value: `${valueOrNil(preview?.establishment?.registrationNumber)} / ${formatDate(
                preview?.establishment?.registrationDate,
              )}`,
            },
          ]}
        />

        <DetailSection
          title="Contractor Information provided by Principal Employer"
          rows={[
            {
              label: "Name & Address of Contractor",
              value: (
                <>
                  {valueOrNil(preview?.contractor?.name)}
                  <br />
                  {valueOrNil(preview?.contractor?.address)}
                </>
              ),
            },
            {
              label:
                "Maximum number of Contract Labour proposed to be employed in the establishment on any date",
              value: valueOrNil(preview?.license?.maxLabours),
            },
            {
              label:
                "Nature of work in which Contract Labour is employed or is to be employed in the establishment",
              value: valueOrNil(natureOfWork),
            },
            {
              label:
                "Duration of the proposed contract work(give particulars of proposed date of ending)",
              value: valueOrNil(preview?.contractor?.duration),
            },
          ]}
        />

        <DetailSection
          title="License Information"
          rows={[
            {
              label: "Name & Address of Contractor",
              value: (
                <>
                  {valueOrNil(preview?.contractor?.name)}
                  <br />
                  {valueOrNil(preview?.contractor?.address)}
                </>
              ),
            },
            {
              label: "Work-site address of contractor",
              value: (
                <>
                  {valueOrNil(contractorWorksite)}
                  <br />
                  <span className="text-red-600 font-bold">
                    Note:- Your application will be forwarded to RLO based on
                    worksite address in issued license/previous renewal.
                  </span>
                </>
              ),
            },
            {
              label: "Number and Date of the License",
              value: `${valueOrNil(preview?.license?.licenseNumber)} issued on ${formatDate(
                preview?.license?.licenseDate,
              )}`,
            },
            {
              label:
                "Maximum no. of contract labour employed by the contractor on any day",
              value: (
                <span className="font-bold">
                  {valueOrNil(preview?.license?.maxLabours)}{" "}
                  <span className="text-red-600">**</span>
                </span>
              ),
            },
            {
              label: "Date of expiry of the previous license",
              value: (
                <span className="font-bold">
                  {formatDate(preview?.license?.validUpto)}{" "}
                  <span className="text-red-600">**</span>
                </span>
              ),
            },
            {
              label: "Applicable renewal fees to be paid",
              value: (
                <span className="font-bold">
                  ₹{valueOrNil(preview?.license?.renewalFee)}/-{" "}
                  <span className="text-red-600">**</span>
                  {preview?.license?.isExtraFees ? (
                    <div className="text-xs text-red-700">
                      including 25% extra as late charges
                    </div>
                  ) : null}
                </span>
              ),
            },
            {
              label: "Co-operative Society",
              value: preview?.license?.isCooperative ? "Yes" : "No",
            },
          ]}
        />

        <DetailSection
          title="Rate of Wages,DA and other cash benefits paid/ to be paid to each category of contract labour"
          rows={[
            {
              label: "Unskilled",
              value: valueOrNil(preview?.wages?.unskilledRateWages),
            },
            {
              label: "Semi-skilled",
              value: valueOrNil(preview?.wages?.semiskilledRateWages),
            },
            {
              label: "Skilled",
              value: valueOrNil(preview?.wages?.skilledRateWages),
            },
            {
              label: "Highly-skilled",
              value: valueOrNil(preview?.wages?.highlyskilledRateWages),
            },
            {
              label: "Daily hours of Work, Spread over time",
              value: (
                <>
                  Hours of Work:-{valueOrNil(preview?.wages?.hoursWork)} hr(s)
                  <br />
                  Spread over time:-{valueOrNil(preview?.wages?.spredOver)}{" "}
                  hr(s)
                </>
              ),
            },
          ]}
        />

        <DetailSection
          title="Other Condition of service like leave/holidays etc. of the contract labour"
          rows={[
            {
              label: "Whether weekly holiday(s) observed and on which day",
              value: weeklyHolidays,
            },
            {
              label:
                "Whether weekly holiday(s) so observed was paid holiday(s)",
              value: valueOrNil(preview?.leaves?.holidayWages),
            },
            {
              label: "Number of Annual leave",
              value: valueOrNil(preview?.leaves?.annualLeaveNo),
            },
            {
              label: "Number of Casual leave",
              value: valueOrNil(preview?.leaves?.casualLeaveNo),
            },
            {
              label: "Number of Earned leave",
              value: valueOrNil(preview?.leaves?.earnedLeaveNo),
            },
            {
              label: "Number of Sick leave",
              value: valueOrNil(preview?.leaves?.sickLeaveNo),
            },
            {
              label: "Number of Maternity leave",
              value: valueOrNil(preview?.leaves?.maternityLeaveNo),
            },
            {
              label: "Number of Other leave",
              value: valueOrNil(preview?.leaves?.otherLeaveNo),
            },
            {
              label: "Special benefits provided, if any",
              value: valueOrNil(preview?.other?.specialBenefits),
            },
            {
              label:
                "Contribution made under the Employees State Insurance Act,1948",
              value: valueOrNil(preview?.other?.stateInsurance),
            },
            {
              label:
                "Contribution made under the Employees Provident Fund and Miscellaneous Provision Act,1952",
              value: valueOrNil(preview?.other?.miscellaneousProvisions),
            },
            {
              label:
                "Whether the license of the contractor was suspended or revoked",
              value: formatDate(preview?.other?.contractorRevoking),
            },
          ]}
        />

        {/* <DetailSection title="Uploaded Documents" rows={uploadedDocumentRows} /> */}
      </div>
    </>
  );
};

export default ContractorLicenseDetailsView;
