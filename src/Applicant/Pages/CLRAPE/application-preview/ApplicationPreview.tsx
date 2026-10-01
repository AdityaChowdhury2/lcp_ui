import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import type { Contractor } from "../contractor-management/constants";
import { selectContractors } from "@/store/contractorsSlice";
import {
  fetchApplicationPreview,
  selectPreviewState,
  resetPreview,
} from "@/store/previewSlice";
import type { AppDispatch } from "@/store/store";
import {
  type PreviewTableRow,
  submitClraAmendmentPreview,
  fetchDocumentByCode,
} from "./previewApi";
import { DocumentsSection } from "./components/DocumentsSection";
import { EstablishmentSection } from "./components/EstablishmentSection";
import { FeesSection } from "./components/FeesSection";
import { TradeUnionSection } from "./components/TradeUnionSection";
import { PreviewTable } from "./components/PreviewTable";
import { SectionHeader } from "./components/SectionHeader";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

interface DeclarationFormData {
  declaration: boolean;
}

/* -------------------------------------------------------------------------- */
/* Validation                                                                 */
/* -------------------------------------------------------------------------- */

const declarationSchema = yup.object({
  declaration: yup
    .boolean()
    .required()
    .oneOf([true], "You must accept the declaration"),
});

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

const SECTION = {
  CONTRACTORS: "CONTRACTORS AND CONTRACT LABOUR DETAILS",
} as const;

const HEADER_BG = "bg-[#7c8a96] text-white";

/** Map a single contractor to preview table rows */
function contractorToPreviewRows(contractor: Contractor): PreviewTableRow[] {
  const employmentRange =
    contractor.employmentFrom && contractor.employmentTo
      ? `${contractor.employmentFrom} to ${contractor.employmentTo}`
      : contractor.employmentFrom ?? contractor.employmentTo ?? "—";

  const addressParts = contractor.address
    ? contractor.address.split(",").map((s) => s.trim())
    : [];
  const addressValue = addressParts.length > 0 ? addressParts.join(", ") : "—";

  return [
    { label: "Contractor Type", value: "New Contractor" },
    { label: "Name of the Contractor", value: contractor.name },
    { label: "Email of the Contractor", value: contractor.email ?? "—" },
    { label: "Address of the Contractor", value: addressValue },
    { label: "Nature of Work", value: contractor.nature || "—" },
    { label: "Maximum Contractor Labour", value: String(contractor.maxLabour) },
    { label: "Estimated Employment Date", value: employmentRange },
  ];
}

function SingleContractorBlock({
  index,
  rows,
}: {
  index: number;
  rows: PreviewTableRow[];
}) {
  return (
    <div className="border bg-white">
      <div className={`${HEADER_BG} font-semibold px-4 py-2 text-center sticky`}>
        Contractor-{index + 1}
      </div>
      <div className="max-h-[380px] overflow-y-auto">
        <PreviewTable rows={rows} stickyHeader />
      </div>
    </div>
  );
}

function ContractorsSection({
  contractorsOverride,
}: {
  contractorsOverride: Contractor[] | null;
}) {
  const reduxContractors = useSelector(selectContractors);
  const contractors = contractorsOverride ?? reduxContractors;
  const contractorBlocks = useMemo(
    () =>
      contractors.map((c, index) => ({
        id: c.id,
        index,
        rows: contractorToPreviewRows(c),
      })),
    [contractors]
  );

  return (
    <>
      <SectionHeader title={SECTION.CONTRACTORS} />
      {contractorBlocks.length === 0 ? (
        <div className="border bg-white text-center py-4 font-semibold text-[13px]">
          No contractor added
        </div>
      ) : (
        contractorBlocks.map(({ id, index, rows }) => (
          <SingleContractorBlock key={id} index={index} rows={rows} />
        ))
      )}
    </>
  );
}

const DECLARATION_LABEL = (
  <>
    <span className="text-red-600">*</span> I hereby declare that the particulars given
    above are true to the best of my knowledge and belief.
  </>
);

function DeclarationSection({
  register,
  errorMessage,
}: {
  register: ReturnType<typeof useForm<DeclarationFormData>>["register"];
  errorMessage: string | undefined;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-start gap-2 text-[14px]">
        <input type="checkbox" {...register("declaration")} className="mt-1" />
        <span>{DECLARATION_LABEL}</span>
      </div>
      {errorMessage && (
        <p className="text-red-600 text-sm" role="alert">
          {errorMessage}
        </p>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Main component                                                             */
/* -------------------------------------------------------------------------- */

interface ApplicationPreviewProps {
  /** When provided (e.g. from route or parent), used for GET final-preview API. Else read from ?applicationId= */
  applicationId?: string | null;
  isEditable?: boolean;
}

const ApplicationPreview: React.FC<ApplicationPreviewProps> = ({
  applicationId: applicationIdProp,
  isEditable = true,
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { data: previewData, loading, error, dataFromApi } = useSelector(selectPreviewState);

  const [searchParams] = useSearchParams();
  const applicationId = applicationIdProp ?? searchParams.get("applicationId") ?? null;
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!applicationId) {
      dispatch(resetPreview());
      return;
    }
    dispatch(fetchApplicationPreview(applicationId));
  }, [applicationId, dispatch]);

  const { register, handleSubmit, formState: { errors } } = useForm<DeclarationFormData>({
    resolver: yupResolver(declarationSchema),
    defaultValues: { declaration: false },
  });

  const onSubmit = async () => {
    if (!applicationId) {
      toast.error("Application ID missing");
      return;
    }

    if (!dataFromApi) {
      toast.error("Preview data not loaded");
      return;
    }

    // The total Maximum Contractor Labour across all active contractors must not
    // exceed the Maximum Number of Contract Labour per contractor recorded in the
    // Establishment Details. Block submission otherwise.
    const maxPerEstablishment = Number(previewData.eAnyDayMaxNumOfWorkmen);
    const totalContractorLabour = (previewData.contractors ?? []).reduce(
      (sum, c) => sum + (Number(c.maxLabour) || 0),
      0
    );
    if (
      Number.isFinite(maxPerEstablishment) &&
      maxPerEstablishment > 0 &&
      totalContractorLabour > maxPerEstablishment
    ) {
      toast.error(
        `Total number of maximum contractor labour for all the contractors (${totalContractorLabour}) cannot exceed the Maximum Number of Contract Labour to be employed on any day through each contractor (${maxPerEstablishment}). Please adjust the contractors before submitting.`
      );
      return;
    }

    try {
      setIsSubmitting(true);

      const numericId =
        previewData.applicationIdNumeric ??
        (Number(applicationId) || applicationId);

      const retFees = previewData.fees.total || "0";
      const maxWorkmen =
        previewData.eAnyDayMaxNumOfWorkmen &&
          String(previewData.eAnyDayMaxNumOfWorkmen).trim() !== ""
          ? previewData.eAnyDayMaxNumOfWorkmen
          : "0";

      const res = await submitClraAmendmentPreview({
        applicationId: numericId,
        retFees,
        eAnyDayMaxNumOfWorkmen: maxWorkmen,
      });

      toast.success(
        (res && typeof res.message === "string"
          ? res.message
          : "Amendment submitted successfully") as string
      );

      // Clear all CLRA-related session storage
      const clraCtxKeys = [
        "CLRA_CTX",
        "CLRA_AMENDMENT_CTX",
        "CLRA_AMENDMENT_ENCRYPT_ID",
        "CLRA_AMENDMENT_FIELDS",
        "CLRA_AMENDMENT_PARENT_CTX"
      ];

      clraCtxKeys.forEach((key) => sessionStorage.removeItem(key));

      // Optional: redirect to applicant dashboard for consistency with BOCWA
      navigate("/applicant-dashboard");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Final submission failed";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewDocument = async (documentCode: string) => {
    if (!applicationId) {
      toast.error("Application ID missing");
      return;
    }

    try {
      const response = await fetchDocumentByCode({
        enapplicationId: applicationId,
        documentCode,
        source: "F",
      });

      const base64Content = String(response?.filecontent ?? "").trim();
      if (!base64Content) {
        toast.error("File content not available");
        return;
      }

      const cleanedBase64 = base64Content.includes(",")
        ? base64Content.split(",")[1]
        : base64Content;
      const byteCharacters = atob(cleanedBase64.replace(/\s/g, ""));
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }

      const blob = new Blob([new Uint8Array(byteNumbers)], {
        type: "application/pdf",
      });
      const blobUrl = window.URL.createObjectURL(blob);
      window.open(blobUrl, "_blank");
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 5000);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Unable to fetch document.";
      toast.error(msg);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#e5e7eb] p-4 flex items-center justify-center min-h-[200px]">
        <p className="text-gray-600">Loading preview...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#e5e7eb] p-4">
        <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="bg-[#e5e7eb] p-4 space-y-6 mb-15">
        <EstablishmentSection
          leftRows={previewData.establishmentLeftRows}
          rightRows={previewData.establishmentRightRows}
          authorizedOffice={previewData.authorizedOffice}
        />
        <DocumentsSection
          applicationId={applicationId}
          documents={previewData.documents}
          onViewDocument={handleViewDocument}
        />
        <FeesSection fees={previewData.fees} />
        <ContractorsSection
          contractorsOverride={dataFromApi ? previewData.contractors : null}
        />
        <TradeUnionSection tradeUnions={previewData.tradeUnions} />
        {isEditable && (
          <DeclarationSection
            register={register}
            errorMessage={errors.declaration?.message}
          />
        )}
        {isEditable && (
          <div className="flex justify-end">
            <button
              type="submit"
              // className="bg-[#2f5f85] text-white px-5 py-2 rounded text-sm"
              className="bg-[#2f5f85] text-white px-5 py-2 rounded text-sm disabled:opacity-60"
              disabled={isSubmitting}
            >
              {isSubmitting ? "SUBMITTING..." : "SUBMIT"}
            </button>
          </div>
        )}
      </div>
    </form>
  );
};

export default ApplicationPreview;
