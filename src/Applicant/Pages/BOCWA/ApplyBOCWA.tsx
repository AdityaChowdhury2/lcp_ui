import React, { useRef, useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { API_BASE } from "@/constants/constants";

// UI checkbox → Backend amendment key
const fieldKeyMap: Record<string, string> = {
  employer_name_address: "emp_info",
  establishment_name_address: "e_permanent_address",
  registered_office_address: "postal_address",
  manager_details: "manager_info",
  nature_of_work: "e_nature_of_work",
  max_workers: "max_num_of_workmen",
  estimated_dates: "est_date_comm",
};

// Backend → UI (needed for GET prefill)
const reverseFieldKeyMap: Record<string, string> = Object.fromEntries(
  Object.entries(fieldKeyMap).map(([ui, backend]) => [backend, ui])
);

const ApplyBOCWA: React.FC = () => {

  const navigate = useNavigate();

  const location = useLocation();

  const locationState = location.state as any;

  let applicationID = locationState?.applicationID;
  let applicantSubdivisionCode = locationState?.applicantSubdivisionCode;
  let applicantBlockCode = locationState?.applicantBlockCode;

  const [searchParams] = useSearchParams();

  const id = searchParams.get("id");

  const hasFetched = useRef(false);

  /* ✅ Fallback if page refreshed OR came from Reset */
  if (!applicationID) {
    const stored = sessionStorage.getItem("BOCWA_AMENDMENT_CTX");
    if (stored) {
      const parsed = JSON.parse(stored);
      applicationID = parsed.applicationID;
      applicantSubdivisionCode = parsed.applicantSubdivisionCode;
      applicantBlockCode = parsed.applicantBlockCode;
    }
  }

  /* ✅ Persist Amendment Context (survives refresh/reset/navigation) */
  useEffect(() => {
    if (!applicationID) return;

    sessionStorage.setItem(
      "BOCWA_AMENDMENT_CTX",
      JSON.stringify({
        applicationID,
        applicantSubdivisionCode,
        applicantBlockCode,
      })
    );
  }, [applicationID, applicantSubdivisionCode, applicantBlockCode]);

  /** From previous step (AmendmentRegCertificateBOCWA): API returns referenceId for final-preview */
  const referenceId = (location.state as { referenceId?: string } | null)?.referenceId;
  const effectiveApplicationId = applicationID ?? referenceId;

  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const toggleCheck = (name: string) => {
    setChecked((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const [checkedFinal, setCheckedFinal] = useState<boolean>(false);

  const fields = [
    {
      key: "employer_name_address",
      label: "Full name and address of the employer",
    },
    {
      key: "establishment_name_address",
      label: "Full Name and permanent address of the Establishment",
    },
    {
      key: "registered_office_address",
      label: "Registered Office address of the Establishment",
    },
    {
      key: "manager_details",
      label:
        "Full name and address of the Manager or Person responsible for the supervision and control of the Establishment",
    },
    {
      key: "nature_of_work",
      label:
        "Nature of building or other construction work is to be carried on",
    },
    {
      key: "max_workers",
      label:
        "Maximum number of building workers to be employed on any day",
    },
    {
      key: "estimated_dates",
      label:
        "Estimated date of commencement and completion of building or other construction work",
    },
  ];

  // For fetching the existing amendment fields and pre-checking the checkboxes
  useEffect(() => {
    if (hasFetched.current) return; // prevents second call
    hasFetched.current = true;

    const fetchAmendmentFields = async () => {
      try {
        if (!id) return;

        const authData = localStorage.getItem("lc_portal_auth");
        if (!authData) return;

        const token = JSON.parse(authData)?.token;

        const response = await fetch(
          `${API_BASE}applicant-module/bocwa-amendment/${encodeURIComponent(id)}/fields`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) return;

        const result: string[] = await response.json();

        const preChecked: Record<string, boolean> = {};

        result.forEach((backendKey) => {
          const uiKey = reverseFieldKeyMap[backendKey];  // ✔ backend ➜ UI
          if (uiKey) preChecked[uiKey] = true;
        });

        setChecked(preChecked);
      } catch (err) {
        console.error(err);
      }
    };

    fetchAmendmentFields();
  }, [id]);

  // Handle final submission of selected fields for amendment
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedUIFields = Object.keys(checked).filter((key) => checked[key]);

    if (selectedUIFields.length === 0) {
      setCheckedFinal(true);
      return;
    }
    setCheckedFinal(false);

    const amendedFields = selectedUIFields
      .map((uiKey) => fieldKeyMap[uiKey])   // ✔ correct direction
      .filter(Boolean);

    sessionStorage.setItem(
      "BOCWA_AMENDMENT_FIELDS",
      JSON.stringify({ amendedFields })
    );

    if (effectiveApplicationId) {
      try {
        const authData = localStorage.getItem("lc_portal_auth");
        if (!authData) {
          toast.error("Authentication error. Please login again.");
          return;
        }
        const token = JSON.parse(authData)?.token;
        const payload = {
          application_id: effectiveApplicationId,
          applicant_subdivision_code: applicantSubdivisionCode,
          applicant_block_code: applicantBlockCode,
          amended_fields: amendedFields,
        };
        const response = await fetch(
          `${API_BASE}applicant-module/applications/amendment/bocwa-registration/step-two`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
          }
        );
        const result = await response.json();
        if (!response.ok || result.error) {
          toast.error(result.message || "Something went wrong");
          return;
        }

        const encryptID = result.encryptID;

        sessionStorage.setItem(
          "BOCWA_AMENDMENT_ENCRYPT_ID",
          JSON.stringify({
            encryptID: encryptID
          })
        );

        toast.success(result.message);

        navigate(`/amendment-bocwa/bocwa-amendment-submit?id=${effectiveApplicationId}`);
      } catch (err) {
        console.error(err);
        toast.error("Server error. Please try again.");
      }
    } else {
      if (referenceId) {
        navigate(`/amendment-bocwa/bocwa-amendment-submit?id=${referenceId}`);
      } else {
        navigate("/amendment-bocwa/bocwa-amendment-submit");
      }
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <h1 className="text-lg bg-white font-semibold p-4 mb-4">
        AMENDMENT OF REGISTRATION CERTIFICATE FOR BOCWA
      </h1>

      <div className="bg-[#2A628C] text-white px-4 py-2 font-semibold text-sm">
        FIELDS FOR AMENDMENT IN APPLICATION OF REGISTRATION UNDER BOCWA, ACT
      </div>

      <form onSubmit={handleSubmit} className="bg-white pb-6">
        <div className="p-4 text-sm">
          <span className="font-semibold">
            Note : Tick the fields which is to be amended by the Employer for
            Registration Number :  issued on Date: 01st Sep,
            2025
          </span>
        </div>

        <div className="px-6 space-y-4">
          {fields.map((field) => (
            <label
              key={field.key}
              className="flex items-start gap-3 text-sm cursor-pointer"
            >
              <input
                type="checkbox"
                checked={!!checked[field.key]}
                onChange={() => toggleCheck(field.key)}
                className="mt-1 h-4 w-4 border-gray-400"
              />
              <span>{field.label}</span>
            </label>
          ))}

          {checkedFinal && (
            <p className="text-red-600 text-sm mt-2">
              Please select at least one field to amend.
            </p>
          )}
        </div>

        <div className="flex justify-end mt-6 pr-6">
          <button
            type="submit"
            className="bg-[#2A628C] text-white px-6 py-2 rounded hover:bg-black"
          >
            APPLY
          </button>
        </div>
      </form>
    </div>
  );
};

export default ApplyBOCWA;
