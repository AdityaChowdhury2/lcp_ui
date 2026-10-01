import { FC, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import EmploymentTabBar from "./EmploymentTabBar";
import { useEmploymentFlow } from "./EmploymentFlowContext";
import {
  fetchEmploymentFormTwo,
  confirmEmploymentFormTwo,
  type EmploymentFormTwoResponse,
} from "./ismwLicenseApi";

const fmtDate = (iso: string | null): string => {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
};

const Row: FC<{ label: string; value: React.ReactNode }> = ({
  label,
  value,
}) => (
  <tr className="border-b last:border-0">
    <td className="align-top py-2 pr-3 w-2/5 font-semibold text-gray-700 text-sm">
      {label}
    </td>
    <td className="align-top py-2 text-sm text-gray-800">{value || "—"}</td>
  </tr>
);

const Panel: FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <div className="bg-white rounded shadow border">
    <div className="bg-[#2c5f8a] text-white px-4 py-2 font-semibold text-sm">
      {title}
    </div>
    <div className="p-4">
      <table className="w-full">
        <tbody>{children}</tbody>
      </table>
    </div>
  </div>
);

const FormTwoInformation: FC = () => {
  const navigate = useNavigate();
  const params = useParams();
  const flow = useEmploymentFlow();
  const formSixEncRaw = params["*"] || "";
  // The encrypted key may contain '/' which was URL-encoded in the route; decode it back.
  // Inside the single-path flow the FORM-VI number comes from shared state.
  const formSixEnc = flow?.formSixEnc || decodeURIComponent(formSixEncRaw);

  const [data, setData] = useState<EmploymentFormTwoResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [agree, setAgree] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchEmploymentFormTwo(formSixEnc)
      .then((res) => {
        if (cancelled) return;
        setData(res);
        setAgree(res.meta.alreadyConfirmed);
        // Share an already-existing licence id so the other tabs unlock.
        if (res.meta.licenceIdEnc) flow?.setLicenceIdEnc(res.meta.licenceIdEnc);
      })
      .catch((err) => {
        const message = err?.response?.data?.message;
        toast.error(
          Array.isArray(message)
            ? message[0]
            : message || "Failed to load FORM-II details."
        );
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [formSixEnc]);

  const handleContinue = async () => {
    if (!agree) {
      toast.error("Please confirm the declaration to continue.");
      return;
    }
    try {
      setSubmitting(true);
      const res = await confirmEmploymentFormTwo(formSixEnc);
      toast.success(res.message || "Confirmed");
      if (flow) {
        // Stay on the same path — hand the licence id to shared state and
        // switch to the Application Details tab.
        if (res.licenceIdEnc) flow.setLicenceIdEnc(res.licenceIdEnc);
        flow.goToTab("application");
      } else if (res.route) {
        navigate(res.route);
      }
    } catch (err: any) {
      const message = err?.response?.data?.message;
      toast.error(
        Array.isArray(message) ? message[0] : message || "Failed to confirm."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-[#ecf0f1] min-h-screen pb-10">
      <div className="bg-white border-b border-gray-300 shadow-sm">
        <h1 className="text-lg md:text-xl font-bold text-gray-800 px-6 py-4 tracking-wide">
          ISMW Employment License — FORM-II Information
        </h1>
      </div>

      <EmploymentTabBar
        active="form2"
        formSixEnc={formSixEnc}
        licenceIdEnc={data?.meta.licenceIdEnc}
      />

      <div className="px-4 pt-4">
        {loading ? (
          <div className="p-8 text-gray-600">Loading FORM-II details…</div>
        ) : !data ? (
          <div className="p-8 text-red-600">Unable to load details.</div>
        ) : (
          <>
            <div className="bg-amber-50 border border-amber-300 text-amber-800 text-sm px-4 py-3 rounded mb-4">
              NOTE: Please check the details of the Contractor provided by the
              Principal Employer. In case of any discrepancy, communicate with
              your Principal Employer with a request to amend the Registration.
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Panel title="Establishment where migrant workmen are to be employed">
                <Row label="Establishment Name" value={data.establishment.name} />
                <Row
                  label="Registration Number & Date"
                  value={
                    data.establishment.registrationNumber
                      ? `${data.establishment.registrationNumber} issued on ${fmtDate(
                          data.establishment.registrationDate
                        )}`
                      : "—"
                  }
                />
                <Row
                  label="Establishment Address"
                  value={data.establishment.address}
                />
                <Row
                  label="Type of business / trade / industry"
                  value={data.establishment.natureOfWork}
                />
                <Row
                  label="Principal Employer Name"
                  value={data.establishment.principalEmployerName}
                />
                <Row
                  label="Principal Employer Address"
                  value={data.establishment.principalEmployerAddress}
                />
              </Panel>

              <Panel title="Contractor Details provided by Principal Employer">
                <Row label="Contractor Name" value={data.contractor.name} />
                <Row label="Contractor Address" value={data.contractor.address} />
                <Row
                  label="Nature of work of migrant workmen"
                  value={data.contractor.natureOfWork}
                />
                <Row
                  label="Max. migrant workmen proposed"
                  value={data.contractor.maxWorkmen}
                />
                <Row
                  label="Duration of proposed contract work"
                  value={`${fmtDate(data.contractor.dateCommencement)} TO ${fmtDate(
                    data.contractor.dateTermination
                  )}`}
                />
              </Panel>
            </div>

            <div className="bg-white border rounded shadow mt-4 p-4">
              <label className="flex items-start gap-2 text-sm text-gray-800">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                />
                <span>
                  <span className="text-red-500 font-bold">*</span> I hereby
                  declare that the particulars provided by the Principal Employer
                  given above are true to the best of my knowledge and belief.
                </span>
              </label>
            </div>

            <div className="flex justify-end mt-4">
              <button
                type="button"
                onClick={handleContinue}
                disabled={submitting}
                className="bg-[#337ab7] hover:bg-[#286090] text-white px-6 py-2 rounded text-sm font-semibold disabled:opacity-60"
              >
                {submitting ? "PLEASE WAIT…" : "CONTINUE"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FormTwoInformation;
