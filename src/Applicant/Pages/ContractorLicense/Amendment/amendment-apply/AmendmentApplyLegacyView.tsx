import type { ReactNode } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import type { AmendmentApplyDocLink, AmendmentApplyRow, AmendmentApplyViewModel } from "./amendmentApplyTypes";
import { fetchContractorLicenseAmendmentFileManagedDocument } from "@/store/contractorLicenseAmendmentSlice";
import type { AppDispatch } from "@/store/store";

export const AMENDMENT_APPLY_PAGE_TITLE = "APPLICATION FOR AMMENDMENT OF LICENSE UNDER THE CONTRACT LABOUR (R&A) ACT, 1970";

const subBannerClass = "bg-[#3c4e5a] border-[3px] border-[#e8e8e8] px-2 py-2 text-center text-sm font-bold text-white";

function LegacyGridRow({ row, index }: { row: AmendmentApplyRow; index: number }) {
  const even = index % 2 === 1;
  return (
    <div
      className={`grid grid-cols-1 gap-2 border-b border-gray-200 px-3 py-2.5 text-sm last:border-b-0 lg:grid-cols-[minmax(260px,40%)_1fr] lg:gap-4 ${
        even ? "bg-[#f5f5f5]" : "bg-white"
      }`}
    >
      <div className="font-semibold text-gray-800">{row.label}</div>
      <div className="whitespace-pre-wrap break-words text-gray-900">{row.value}</div>
    </div>
  );
}

function SubBanner({ title }: { title: string }) {
  return (
    <div className={subBannerClass}>
      <span className="block leading-snug">{title}</span>
    </div>
  );
}

function DocumentRow({
  doc,
  odd,
  onOpenPdfDoc,
}: {
  doc: AmendmentApplyDocLink;
  odd: boolean;
  onOpenPdfDoc: (fid: string) => Promise<void>;
}) {
  return (
    <div
      className={`grid grid-cols-1 gap-2 border-b border-gray-200 px-3 py-2.5 text-sm last:border-b-0 lg:grid-cols-[minmax(260px,40%)_1fr] lg:gap-4 ${
        odd ? "bg-white" : "bg-[#f5f5f5]"
      }`}
    >
      <div className="font-semibold text-gray-800">{doc.label}</div>
      <div>
        {doc.href ? (
          <button
            className="inline-flex items-center gap-1.5 text-red-700 underline hover:text-red-900"
            onClick={() => {
              void onOpenPdfDoc(String(doc?.fid));
            }}
          >
            View document
          </button>
        ) : (
          <span className="text-gray-800">No Document uploaded</span>
        )}
      </div>
    </div>
  );
}

export type AmendmentApplyLegacyViewProps = {
  pageTitle?: string;
  formVReferenceDisplay: string;
  licenseNumberDisplay: string;
  issueDateDisplay: string;
  validUptoDisplay: string;
  view: AmendmentApplyViewModel;
  editSection2?: ReactNode;
  editSection3?: ReactNode;
  editSection4?: ReactNode;
};

export function AmendmentApplyLegacyView({
  pageTitle = AMENDMENT_APPLY_PAGE_TITLE,
  formVReferenceDisplay,
  licenseNumberDisplay,
  issueDateDisplay,
  validUptoDisplay,
  view,
  editSection2,
  editSection3,
  editSection4,
}: AmendmentApplyLegacyViewProps) {
  const dispatch = useDispatch<AppDispatch>();

  const handleOpenPdfDoc = async (fid: string) => {
    try {
      const { blobUrl } = await dispatch(fetchContractorLicenseAmendmentFileManagedDocument({ fid })).unwrap();
      window.open(blobUrl, "_blank");
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Unable to fetch document.");
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1200px] border border-gray-300 bg-white shadow-sm">
      <h1 className="border-b border-gray-300 bg-white px-3 py-3 text-center text-sm font-bold uppercase leading-snug text-[#0b2c48] md:text-base">
        {pageTitle}
      </h1>

      {/* Legacy `panel-heading`: centred licence strip (Bootstrap primary / portal theme) */}
      <div className="border-b border-gray-300 bg-[#337ab7] px-4 py-4 text-center text-sm text-white md:text-base">
        <div>
          <span>Form-V/Reference Number: </span>
          <span className="font-semibold text-[#d3e1ec]">{formVReferenceDisplay}</span>
        </div>
        <div className="mt-1">
          <span>License Number: </span>
          <span className="whitespace-pre-line font-semibold text-[#d3e1ec]">{licenseNumberDisplay}</span>
        </div>
        <div className="mt-1">
          <span>Issue Date: </span>
          <span className="font-semibold text-[#d3e1ec]">{issueDateDisplay}</span>
          <span className="mx-2">&nbsp;</span>
          <span>Valid Upto: </span>
          <span className="font-semibold text-[#d3e1ec]">{validUptoDisplay}</span>
        </div>
      </div>

      <div className="border border-t-0 border-gray-300">
        {/* Section 1 */}
        <div className="con-dtls-view-main">
          <h3 className="flex items-center justify-between border border-b-0 border-gray-300 bg-[#d3e1ec] px-3 py-2 text-[15px] font-bold text-[#1a3a52]">
            <span>1.Information Given by Principal Employeer.</span>
          </h3>
          <div className="con-dtls-view-contains border border-t-0 border-gray-300">
            {view.section1.map((row, i) => (
              <LegacyGridRow key={row.label} row={row} index={i} />
            ))}
          </div>
        </div>

        {/* Section 2 */}
        <div className="con-dtls-view-main mt-0">
          <h3 className="flex items-center justify-between border border-b-0 border-gray-300 bg-[#d3e1ec] px-3 py-2 text-[15px] font-bold text-[#1a3a52]">
            <span>2.Name &amp; address of the contractor (Official Information)</span>
            <span className="edit shrink-0 pl-2">{editSection2}</span>
          </h3>
          <div className="con-dtls-view-contains border border-t-0 border-gray-300">
            {view.section2.map((row, i) => (
              <LegacyGridRow key={row.label} row={row} index={i} />
            ))}
          </div>
        </div>

        {/* Section 3 */}
        <div className="con-dtls-view-main mt-0">
          <h3 className="flex items-center justify-between border border-b-0 border-gray-300 bg-[#d3e1ec] px-3 py-2 text-[15px] font-bold text-[#1a3a52]">
            <span>3.Contractor Labour and Worksite Details</span>
            <span className="edit shrink-0 pl-2">{editSection3}</span>
          </h3>
          <div className="con-dtls-view-contains border border-t-0 border-gray-300">
            {view.section3.map((row, i) => (
              <LegacyGridRow key={row.label} row={row} index={i} />
            ))}
            {view.section3DueSecurity ? (
              <div className="border-b border-gray-200 bg-amber-50 px-3 py-2 text-sm text-red-700">
                <strong>{view.section3DueSecurity}</strong>
              </div>
            ) : null}
          </div>
        </div>

        {/* Section 4 */}
        <div className="con-dtls-view-main mt-0">
          <h3 className="flex items-center justify-between border border-b-0 border-gray-300 bg-[#d3e1ec] px-3 py-2 text-[15px] font-bold text-[#1a3a52]">
            <span>4. Particular of Contract Labour</span>
            <span className="edit shrink-0 pl-2">{editSection4}</span>
          </h3>
          <div className="con-dtls-view-contains border border-t-0 border-gray-300">
            {(() => {
              let i = 0;
              return (
                <>
                  {view.section4BeforeWages.map((row) => (
                    <LegacyGridRow key={row.label} row={row} index={i++} />
                  ))}
                  <SubBanner title={view.wagesBannerTitle} />
                  {view.wageRows.map((row) => (
                    <LegacyGridRow key={row.label} row={row} index={i++} />
                  ))}
                  <LegacyGridRow row={view.hoursRow} index={i++} />
                  <SubBanner title={view.leaveBannerTitle} />
                  {view.leaveRows.map((row) => (
                    <LegacyGridRow key={row.label} row={row} index={i++} />
                  ))}
                  <SubBanner title="Uploaded Documents" />
                  {view.documents.map((doc, di) => (
                    <DocumentRow key={doc.label} doc={doc} odd={di % 2 === 0} onOpenPdfDoc={handleOpenPdfDoc} />
                  ))}
                </>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
