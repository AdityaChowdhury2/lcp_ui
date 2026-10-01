import { FC } from "react";
import { useNavigate } from "react-router-dom";
import { useEmploymentFlow } from "./EmploymentFlowContext";

/**
 * Tab bar for the Employment (In West Bengal) ISMW license flow.
 * FORM-II is keyed by the encrypted FORM-VI number; the remaining tabs are
 * keyed by the encrypted licence id (available once FORM-II is confirmed).
 */
export type EmploymentTabKey =
  | "form2"
  | "application"
  | "owners"
  | "workmen"
  | "documents"
  | "preview";

const TABS: { key: EmploymentTabKey; label: string }[] = [
  { key: "form2", label: "FORM-II INFORMATION" },
  { key: "application", label: "APPLICATION DETAILS" },
  { key: "owners", label: "OWNERS DETAILS" },
  { key: "workmen", label: "WORKMEN DETAILS" },
  { key: "documents", label: "DOCUMENTS SECTION" },
  { key: "preview", label: "APPLICATION PREVIEW" },
];

function routeFor(
  key: EmploymentTabKey,
  formSixEnc: string,
  licenceIdEnc: string
): string | null {
  switch (key) {
    case "form2":
      return formSixEnc ? `/establishment-details/${formSixEnc}` : null;
    case "application":
      return licenceIdEnc
        ? `/ismw-license/employment-application/${licenceIdEnc}`
        : null;
    case "owners":
      return licenceIdEnc
        ? `/ismw-license/ownership-info/${licenceIdEnc}`
        : null;
    case "workmen":
      return licenceIdEnc
        ? `/ismw-license/workmen-info/${licenceIdEnc}`
        : null;
    case "documents":
      return licenceIdEnc
        ? `/ismw-license/documents-upload/${licenceIdEnc}`
        : null;
    case "preview":
      return licenceIdEnc
        ? `/ismw-license/employment-preview/${licenceIdEnc}`
        : null;
  }
}

const EmploymentTabBar: FC<{
  active: EmploymentTabKey;
  formSixEnc?: string;
  licenceIdEnc?: string;
}> = ({ active, formSixEnc = "", licenceIdEnc = "" }) => {
  const navigate = useNavigate();
  const flow = useEmploymentFlow();

  // Inside the single-path flow, the shared context is the source of truth for
  // the ids and tab switching is done via state rather than route changes.
  const f6 = flow?.formSixEnc || formSixEnc;
  const licId = flow?.licenceIdEnc || licenceIdEnc;

  const handleSelect = (key: EmploymentTabKey) => {
    if (key === active) return;
    if (flow) {
      // Steps beyond FORM-II require a licence id to exist.
      if (key !== "form2" && !licId) return;
      flow.goToTab(key);
      return;
    }
    const route = routeFor(key, f6, licId);
    if (route) navigate(route);
  };

  return (
    <div className="flex flex-wrap gap-2 px-4 pt-4">
      {TABS.map((tab) => {
        const isActive = tab.key === active;
        const route = routeFor(tab.key, f6, licId);
        const disabled = (!flow && !route) || (tab.key !== "form2" && !licId);
        return (
          <button
            key={tab.key}
            type="button"
            disabled={disabled && !isActive}
            onClick={() => handleSelect(tab.key)}
            className={[
              "px-4 py-2 text-xs font-semibold border rounded-t",
              isActive
                ? "bg-[#2c5f8a] text-white border-[#2c5f8a]"
                : disabled
                ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                : "bg-white text-[#2c5f8a] border-gray-300 hover:bg-gray-50",
            ].join(" ")}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

export default EmploymentTabBar;
