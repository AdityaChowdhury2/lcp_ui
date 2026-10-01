import { API_BASE } from "@/constants/constants";
import { getAuthToken } from "@/utils/auth";
import axios from "axios";
import { Field, Form, Formik, type FormikValues, useFormikContext } from "formik";
import React, { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

interface StateOption {
  id: number;
  name: string;
}

interface DistrictOption {
  districtCode: number;
  districtName: string;
}

interface SubdivisionOption {
  subDivCode: number;
  subDivName: string;
}

interface DetailView {
  name: string;
  managerUserName: string;
  address: string;
  phone: string;
  email: string;
  hasNotification: boolean;
  notificationFileName: string | null;
  statusLabel: string;
}

interface DetailForm {
  type: string;
  ctuPhone: string;
  ctuOfficeEmail: string;
  ctuAddress: string;
  ctuState: number;
  ctuDist: number;
  ctuSubdivision: string;
  isActive: string;
  managerUserId: number | null;
}

interface DetailResponse {
  status: string;
  enId: string;
  view: DetailView;
  form: DetailForm;
  typeOptions: Record<string, string>;
  states: StateOption[];
  districts: DistrictOption[];
  subdivisions: SubdivisionOption[];
}

interface FormShape {
  type: string;
  ctuPhone: string;
  ctuOfficeEmail: string;
  ctuAddress: string;
  ctuState: number;
  ctuDist: number;
  ctuSubdivision: string;
  isActive: string;
  password: string;
  confirmPassword: string;
}

const emptyForm: FormShape = {
  type: "WT",
  ctuPhone: "",
  ctuOfficeEmail: "",
  ctuAddress: "",
  ctuState: 0,
  ctuDist: 0,
  ctuSubdivision: "",
  isActive: "Y",
  password: "",
  confirmPassword: "",
};

/** WB state / district / subdivision — subdivisions load via shared `GET subdivision/:districtCode` when district changes (same pattern as ParticularInfo & other forms). */
function CtuWbLocationFields({
  states,
  districtOptions,
  loadDistricts,
  clearDistrictOptions,
  token,
}: {
  states: StateOption[];
  districtOptions: DistrictOption[];
  loadDistricts: () => Promise<void>;
  clearDistrictOptions: () => void;
  token: string;
}) {
  const { values, setFieldValue } = useFormikContext<FormShape>();
  const [subdivisionOptions, setSubdivisionOptions] = useState<SubdivisionOption[]>([]);
  const [loadingSubdivisions, setLoadingSubdivisions] = useState(false);

  useEffect(() => {
    const state = Number(values.ctuState);
    const dist = Number(values.ctuDist);
    if (state !== 1 || !dist || Number.isNaN(dist)) {
      setSubdivisionOptions([]);
      setLoadingSubdivisions(false);
      return;
    }

    let cancelled = false;
    setLoadingSubdivisions(true);

    axios
      .get(`${API_BASE}subdivision/${dist}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      })
      .then((res) => {
        const raw = res.data?.data ?? res.data;
        const list = Array.isArray(raw) ? raw : [];
        if (cancelled) return;
        setSubdivisionOptions(
          list.map((s: { sub_div_code: unknown; sub_div_name?: unknown }) => ({
            subDivCode: Number(s.sub_div_code),
            subDivName: String(s.sub_div_name ?? ""),
          })),
        );
      })
      .catch(() => {
        if (!cancelled) setSubdivisionOptions([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingSubdivisions(false);
      });

    return () => {
      cancelled = true;
    };
  }, [values.ctuState, values.ctuDist, token]);

  const wb = Number(values.ctuState) === 1;
  const hasDistrict = Number(values.ctuDist) > 0;

  return (
    <div className="grid grid-cols-1 min-[768px]:grid-cols-3 gap-4">
      <div className="my-[14px]">
        <label className="block text-sm font-bold text-gray-700 mb-2">
          State <span className="text-red-600">*</span>
        </label>
        <Field
          as="select"
          name="ctuState"
          className="w-full px-[12px] py-[6px] h-[34px] border border-[#d2d6de] bg-white focus:border-[#3c8dbc] rounded-none shadow-inner"
          onChange={async (e: React.ChangeEvent<HTMLSelectElement>) => {
            const v = Number(e.target.value);
            await setFieldValue("ctuState", v);
            await setFieldValue("ctuDist", 0);
            await setFieldValue("ctuSubdivision", "");
            if (v === 1) {
              await loadDistricts();
            } else {
              clearDistrictOptions();
            }
          }}
        >
          <option value={0}>- Select -</option>
          {states.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </Field>
      </div>

      <div className="my-[14px]">
        <label className="block text-sm font-bold text-gray-700 mb-2">
          District {wb ? <span className="text-red-600">*</span> : null}
        </label>
        <Field
          as="select"
          name="ctuDist"
          disabled={!wb}
          className="w-full px-[12px] py-[6px] h-[34px] border border-[#d2d6de] bg-white focus:border-[#3c8dbc] rounded-none shadow-inner disabled:bg-gray-100"
          onChange={async (e: React.ChangeEvent<HTMLSelectElement>) => {
            const d = Number(e.target.value);
            await setFieldValue("ctuDist", d);
            await setFieldValue("ctuSubdivision", "");
          }}
        >
          <option value={0}>- Select -</option>
          {districtOptions.map((d) => (
            <option key={d.districtCode} value={d.districtCode}>
              {d.districtName}
            </option>
          ))}
        </Field>
      </div>

      <div className="my-[14px]">
        <label className="block text-sm font-bold text-gray-700 mb-2">
          Subdivision {wb ? <span className="text-red-600">*</span> : null}
          {loadingSubdivisions ? (
            <span className="ml-2 text-xs font-normal text-gray-500">(loading…)</span>
          ) : null}
        </label>
        <Field
          as="select"
          name="ctuSubdivision"
          disabled={!wb || !hasDistrict || loadingSubdivisions}
          className="w-full px-[12px] py-[6px] h-[34px] border border-[#d2d6de] bg-white focus:border-[#3c8dbc] rounded-none shadow-inner disabled:bg-gray-100"
        >
          <option value="">{loadingSubdivisions ? "Loading…" : "- Select -"}</option>
          {subdivisionOptions.map((s) => (
            <option key={s.subDivCode} value={String(s.subDivCode)}>
              {s.subDivName}
            </option>
          ))}
        </Field>
      </div>
    </div>
  );
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const r = reader.result;
      if (typeof r === "string") {
        const parts = r.split("base64,");
        resolve(parts.length > 1 ? parts[1]! : r);
      } else reject(new Error("Could not read file"));
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

const CentralTradeUnionListView = () => {
  const { enId: enIdParam } = useParams<{ enId: string }>();
  const enId = enIdParam ? decodeURIComponent(enIdParam) : "";
  const token = getAuthToken() ?? "";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [view, setView] = useState<DetailView | null>(null);
  const [typeOptions, setTypeOptions] = useState<Record<string, string>>({});
  const [states, setStates] = useState<StateOption[]>([]);
  const [districtOptions, setDistrictOptions] = useState<DistrictOption[]>([]);
  const [initialForm, setInitialForm] = useState<FormShape>(emptyForm);
  const [notificationFile, setNotificationFile] = useState<File | null>(null);

  const loadDistricts = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_BASE}ctu/lookups/districts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDistrictOptions(Array.isArray(data?.result) ? data.result : []);
    } catch {
      setDistrictOptions([]);
    }
  }, [token]);

  const clearDistrictOptions = useCallback(() => {
    setDistrictOptions([]);
  }, []);

  const loadDetail = useCallback(async () => {
    if (!enId) {
      setErrorMsg("Missing record id.");
      setLoading(false);
      return;
    }
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);
    try {
      const { data } = await axios.get<DetailResponse>(
        `${API_BASE}ctu/master-list/view/${encodeURIComponent(enId)}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (data?.status !== "SUCCESS" || !data.view || !data.form) {
        throw new Error("Invalid response");
      }
      setView(data.view);
      setTypeOptions(data.typeOptions || {});
      setStates(Array.isArray(data.states) ? data.states : []);
      const f = data.form;
      setInitialForm({
        type: f.type || "WT",
        ctuPhone: f.ctuPhone || "",
        ctuOfficeEmail: f.ctuOfficeEmail || "",
        ctuAddress: f.ctuAddress || "",
        ctuState: Number(f.ctuState) || 0,
        ctuDist: Number(f.ctuDist) || 0,
        ctuSubdivision: f.ctuSubdivision ? String(f.ctuSubdivision) : "",
        isActive: f.isActive === "N" ? "N" : "Y",
        password: "",
        confirmPassword: "",
      });
      if (f.ctuState === 1) {
        if (Array.isArray(data.districts) && data.districts.length > 0) {
          setDistrictOptions(data.districts);
        } else {
          await loadDistricts();
        }
      } else {
        setDistrictOptions([]);
      }
    } catch (e: unknown) {
      setView(null);
      const msg =
        axios.isAxiosError(e) && e.response?.data?.message
          ? String(e.response.data.message)
          : "Failed to load central trade union details.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  }, [enId, token, loadDistricts]);

  useEffect(() => {
    void loadDetail();
  }, [loadDetail]);

  const openNotificationPdf = async () => {
    if (!enId) return;
    try {
      const { data } = await axios.get<{ base64?: string; fileName?: string }>(
        `${API_BASE}ctu/master-list/view/${encodeURIComponent(enId)}/notification`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const b64 = data?.base64;
      if (!b64) return;
      const binary = atob(b64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      const blob = new Blob([bytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch {
      // ignore
    }
  };

  const handleSubmit = async (values: FormikValues) => {
    if (!enId) return;
    setSaving(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      let notificationBase64: string | undefined;
      let notificationFileName: string | undefined;
      if (notificationFile) {
        notificationBase64 = await fileToBase64(notificationFile);
        notificationFileName = notificationFile.name;
      }

      const body: Record<string, unknown> = {
        type: values.type,
        ctuPhone: String(values.ctuPhone).trim(),
        ctuOfficeEmail: String(values.ctuOfficeEmail).trim(),
        ctuAddress: String(values.ctuAddress).trim(),
        ctuState: Number(values.ctuState),
        isActive: values.isActive,
      };
      const st = Number(values.ctuState);
      if (st === 1) {
        body.ctuDist = Number(values.ctuDist) || 0;
        body.ctuSubdivision = String(values.ctuSubdivision || "").trim();
      }
      const pwd = String(values.password || "").trim();
      if (pwd) {
        body.password = pwd;
        body.confirmPassword = String(values.confirmPassword || "").trim();
      }
      if (notificationBase64) {
        body.notificationBase64 = notificationBase64;
        body.notificationFileName = notificationFileName;
      }

      const { data } = await axios.patch(`${API_BASE}ctu/master-list/${encodeURIComponent(enId)}`, body, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccessMsg(String(data?.message || "Saved successfully."));
      setNotificationFile(null);
      await loadDetail();
    } catch (e: unknown) {
      const msg =
        axios.isAxiosError(e) && e.response?.data?.message
          ? Array.isArray(e.response.data.message)
            ? e.response.data.message.join(", ")
            : String(e.response.data.message)
          : "Save failed.";
      setErrorMsg(msg);
    } finally {
      setSaving(false);
    }
  };

  if (!enId) {
    return (
      <div className="min-h-screen font-['Source_Sans_Pro'] max-w-6xl mx-auto py-6 px-3">
        <p className="text-red-600">Invalid link.</p>
        <Link to="/central-trade-union-list" className="text-[#3c8dbc] underline mt-2 inline-block">
          Back to list
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-['Source_Sans_Pro']">
      <div className="max-w-6xl mx-auto mt-1 mb-2 flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-[24px] font-medium opacity-90">Central Trade Union — View / Edit</h1>
        <Link
          to="/central-trade-union-list"
          className="text-sm px-3 py-1.5 bg-[#3c8dbc] text-white rounded-[3px] no-underline hover:bg-[#357ca5]"
        >
          Back to list
        </Link>
      </div>

      <div className="max-w-6xl mx-auto py-3 space-y-5">
        {loading ? (
          <p className="text-gray-600 text-sm px-2">Loading…</p>
        ) : null}

        {errorMsg ? <p className="text-red-600 text-sm px-2">{errorMsg}</p> : null}
        {successMsg ? <p className="text-green-700 text-sm px-2">{successMsg}</p> : null}

        {view && !loading ? (
          <div className="relative rounded-[3px] bg-white border-t-[3px] border-t-[#3c8dbc] w-full shadow">
            <div className="p-[10px] overflow-hidden">
              <label className="block text-sm font-normal text-gray-700 mb-2 px-[5px]">Details</label>
              <div className="overflow-x-auto px-[5px]">
                <table className="w-full border border-[#d2d6de] text-[13px]">
                  <thead>
                    <tr>
                      <th className="bg-[#3c8dbc] text-white font-medium text-left px-3 py-2 w-[30%] border-r border-[#2f6f92]">
                        Parameters
                      </th>
                      <th className="bg-[#3c8dbc] text-white font-medium text-left px-3 py-2 border-[#2f6f92]">Inputs</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-[#e5e7eb]">
                      <td className="px-3 py-2 border-r border-[#e5e7eb] text-gray-800">Name</td>
                      <td className="px-3 py-2 text-gray-900">{view.name}</td>
                    </tr>
                    <tr className="border-b border-[#e5e7eb]">
                      <td className="px-3 py-2 border-r border-[#e5e7eb] text-gray-800">User name</td>
                      <td className="px-3 py-2 text-gray-900">{view.managerUserName}</td>
                    </tr>
                    <tr className="border-b border-[#e5e7eb]">
                      <td className="px-3 py-2 border-r border-[#e5e7eb] text-gray-800">Address</td>
                      <td className="px-3 py-2 text-gray-900">{view.address}</td>
                    </tr>
                    <tr className="border-b border-[#e5e7eb]">
                      <td className="px-3 py-2 border-r border-[#e5e7eb] text-gray-800">Phone no.</td>
                      <td className="px-3 py-2 text-gray-900">{view.phone}</td>
                    </tr>
                    <tr className="border-b border-[#e5e7eb]">
                      <td className="px-3 py-2 border-r border-[#e5e7eb] text-gray-800">Email</td>
                      <td className="px-3 py-2 text-gray-900">{view.email}</td>
                    </tr>
                    <tr className="border-b border-[#e5e7eb]">
                      <td className="px-3 py-2 border-r border-[#e5e7eb] text-gray-800">Notification file</td>
                      <td className="px-3 py-2 text-gray-900">
                        {view.hasNotification ? (
                          <button
                            type="button"
                            className="text-[#3c8dbc] underline"
                            onClick={() => void openNotificationPdf()}
                          >
                            View PDF
                            {view.notificationFileName ? ` (${view.notificationFileName})` : ""}
                          </button>
                        ) : (
                          "-"
                        )}
                      </td>
                    </tr>
                    <tr className="border-b border-[#e5e7eb]">
                      <td className="px-3 py-2 border-r border-[#e5e7eb] text-gray-800">Status</td>
                      <td className="px-3 py-2 text-gray-900">{view.statusLabel}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : null}

        {!loading && view ? (
          <div className="relative rounded-[3px] bg-white border-t-[3px] border-t-[#3c8dbc] w-full shadow">
            <div className="p-[10px] overflow-hidden">
              <div className="px-[5px] py-2 mb-2 border-b border-[#e5e7eb] text-white bg-[#3c8dbc] text-sm font-medium rounded-t">
                Actions
              </div>
              <Formik
                key={enId}
                initialValues={initialForm}
                enableReinitialize
                onSubmit={handleSubmit}
              >
                {({ isSubmitting }) => (
                  <Form className="px-[15px] pb-4">
                    <div className="grid grid-cols-1 min-[768px]:grid-cols-3 gap-4">
                      <div className="my-[14px]">
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          Trade union / Federation type <span className="text-red-600">*</span>
                        </label>
                        <Field
                          as="select"
                          name="type"
                          className="w-full px-[12px] py-[6px] h-[34px] border border-[#d2d6de] bg-white focus:border-[#3c8dbc] rounded-none shadow-inner"
                        >
                          {Object.entries(typeOptions).map(([code, label]) => (
                            <option key={code} value={code}>
                              {label}
                            </option>
                          ))}
                        </Field>
                      </div>
                      <div className="my-[14px]">
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          Phone number <span className="text-red-600">*</span>
                        </label>
                        <Field
                          type="text"
                          name="ctuPhone"
                          className="w-full px-[12px] py-[6px] h-[34px] border border-[#d2d6de] bg-white focus:border-[#3c8dbc] rounded-none shadow-inner"
                        />
                      </div>
                      <div className="my-[14px]">
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          E-mail <span className="text-red-600">*</span>
                        </label>
                        <Field
                          type="email"
                          name="ctuOfficeEmail"
                          className="w-full px-[12px] py-[6px] h-[34px] border border-[#d2d6de] bg-white focus:border-[#3c8dbc] rounded-none shadow-inner"
                        />
                      </div>
                    </div>

                    <div className="my-[14px]">
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Address <span className="text-red-600">*</span>
                      </label>
                      <Field
                        as="textarea"
                        name="ctuAddress"
                        rows={4}
                        className="w-full px-[12px] py-[6px] border border-[#d2d6de] bg-white focus:border-[#3c8dbc] rounded-none shadow-inner"
                      />
                    </div>

                    <CtuWbLocationFields
                      states={states}
                      districtOptions={districtOptions}
                      loadDistricts={loadDistricts}
                      clearDistrictOptions={clearDistrictOptions}
                      token={token}
                    />

                    <div className="grid grid-cols-1 min-[768px]:grid-cols-3 gap-4">
                      <div className="my-[14px]">
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          Active <span className="text-red-600">*</span>
                        </label>
                        <Field
                          as="select"
                          name="isActive"
                          className="w-full px-[12px] py-[6px] h-[34px] border border-[#d2d6de] bg-white focus:border-[#3c8dbc] rounded-none shadow-inner"
                        >
                          <option value="Y">Yes</option>
                          <option value="N">No</option>
                        </Field>
                      </div>
                      <div className="my-[14px]">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
                        <Field
                          type="password"
                          name="password"
                          autoComplete="new-password"
                          placeholder="Leave blank to keep unchanged"
                          className="w-full px-[12px] py-[6px] h-[34px] border border-[#d2d6de] bg-white focus:border-[#3c8dbc] rounded-none shadow-inner"
                        />
                      </div>
                      <div className="my-[14px]">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Confirm password</label>
                        <Field
                          type="password"
                          name="confirmPassword"
                          autoComplete="new-password"
                          className="w-full px-[12px] py-[6px] h-[34px] border border-[#d2d6de] bg-white focus:border-[#3c8dbc] rounded-none shadow-inner"
                        />
                      </div>
                    </div>

                    <div className="my-[14px]">
                      <label className="block text-sm font-bold text-gray-700 mb-2">Upload notification file (PDF)</label>
                      <input
                        type="file"
                        accept="application/pdf,.pdf"
                        className="block w-full text-sm text-gray-700"
                        onChange={(e) => {
                          const f = e.target.files?.[0] ?? null;
                          setNotificationFile(f);
                        }}
                      />
                      {notificationFile ? (
                        <p className="text-xs text-gray-600 mt-1">Selected: {notificationFile.name}</p>
                      ) : null}
                    </div>

                    <div className="flex gap-3 mt-4">
                      <button
                        type="submit"
                        disabled={isSubmitting || saving}
                        className="px-[12px] py-[6px] text-[14px] bg-[#3c8dbc] h-[34px] hover:bg-[#357ca5] text-white font-normal uppercase rounded-none shadow-md disabled:opacity-60"
                      >
                        {saving ? "Saving…" : "Save"}
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default CentralTradeUnionListView;
