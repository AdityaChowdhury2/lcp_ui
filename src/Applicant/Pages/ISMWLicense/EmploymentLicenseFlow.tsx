import { FC, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { EmploymentFlowContext } from "./EmploymentFlowContext";
import type { EmploymentTabKey } from "./EmploymentTabBar";
import FormTwoInformation from "./FormTwoInformation";
import EmploymentApplication from "./EmploymentApplication";
import OwnersDetails from "./OwnersDetails";
import WorkmenDetails from "./WorkmenDetails";
import DocumentsSection from "./DocumentsSection";
import ApplicationPreview from "./ApplicationPreview";

/**
 * Single-path container for the Employment (In West Bengal) ISMW license flow.
 *
 * Entered after the location + FORM-VI verification step with the encrypted
 * FORM-VI number in the URL. Every subsequent step (FORM-II, application,
 * owners, workmen, documents, preview) is rendered here and switched via state,
 * so the browser URL never changes across tabs.
 */
const EmploymentLicenseFlow: FC = () => {
  const params = useParams();
  const formSixEnc = decodeURIComponent(params["*"] || "");

  const [activeTab, setActiveTab] = useState<EmploymentTabKey>("form2");
  const [licenceIdEnc, setLicenceIdEnc] = useState("");

  const ctx = useMemo(
    () => ({
      formSixEnc,
      licenceIdEnc,
      setLicenceIdEnc,
      goToTab: setActiveTab,
    }),
    [formSixEnc, licenceIdEnc]
  );

  return (
    <EmploymentFlowContext.Provider value={ctx}>
      {activeTab === "form2" && <FormTwoInformation />}
      {activeTab === "application" && <EmploymentApplication />}
      {activeTab === "owners" && <OwnersDetails />}
      {activeTab === "workmen" && <WorkmenDetails />}
      {activeTab === "documents" && <DocumentsSection />}
      {activeTab === "preview" && <ApplicationPreview />}
    </EmploymentFlowContext.Provider>
  );
};

export default EmploymentLicenseFlow;
